import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Spinner, Form, ButtonGroup, Button, ToastContainer, Toast, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getCoinOHLC, getSupportedVsCurrencies, getAllCoins } from '../../services/service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';

//^ chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

//& custom candlestick renderer plugin fr chart.js
const candlestickPlugin = {
  id: 'candlestick',
  beforeDatasetsDraw(chart) {
    const { ctx, data, scales } = chart;
    const dataset = data.datasets[0];
    
    if (!dataset || !dataset.data || dataset.data.length === 0) {
      return;
    }
    
    ctx.save();
    ctx.lineWidth = 2;
    
    dataset.data.forEach((candle, index) => {
      //~ ensure we have all required values
      if (!Array.isArray(candle) || candle.length < 5) return;
      
      const [, open, high, low, close] = candle; //~ timestamp not used
      
      //~ skip invalid data points
      if (open == null || high == null || low == null || close == null || 
          isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        return;
      }
      
      //~ get pixel positions - critical for visualization
      const x = scales.x.getPixelForValue(index);
      const yOpen = scales.y.getPixelForValue(open);
      const yHigh = scales.y.getPixelForValue(high);
      const yLow = scales.y.getPixelForValue(low);
      const yClose = scales.y.getPixelForValue(close);
      
      //~ ensure pixel values are valid (sometimes scale issues can cause this)
      if (isNaN(yOpen) || isNaN(yHigh) || isNaN(yLow) || isNaN(yClose)) {
        return;
      }
      
      //~ determine bullish (green) / bearish (red)
      const isGreen = close >= open;
      ctx.strokeStyle = isGreen ? 'rgba(0, 190, 0, 1)' : 'rgba(255, 76, 76, 1)';
      ctx.fillStyle = isGreen ? 'rgba(0, 190, 0, 0.3)' : 'rgba(255, 76, 76, 0.3)';
      
      //~ calculate width based on chart area
      const barWidth = Math.max(6, (scales.x.getPixelForValue(1) - scales.x.getPixelForValue(0)) * 0.7);
      const halfWidth = barWidth / 2;
      
      //~ draw the high-low line (wick)
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      //~ draw rectangle for open-close body
      //~ ensure minimum height for visibility
      const heightDiff = Math.max(Math.abs(yClose - yOpen), 2);
      const yStart = Math.min(yOpen, yClose);
      
      ctx.fillRect(x - halfWidth, yStart, barWidth, heightDiff);
      ctx.strokeRect(x - halfWidth, yStart, barWidth, heightDiff);
    });
    
    ctx.restore();
  }
};

//& display OHLC candlestick chart - memoized fr performance
function OHLCChart({ currency = 'usd' }) {
  //~ only use single coin selection
  const [selectedCoins, setSelectedCoins] = useState(['bitcoin']);
  const [selectedDays, setSelectedDays] = useState(7);
  const [chartData, setChartData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [allCoins, setAllCoins] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  
  //& days options
  const daysOptions = [
    { value: 1, label: '1d' },
    { value: 7, label: '7d' },
    { value: 30, label: '30d' }
  ];
  
  //& fetch full coin list fr dynamic selectors
  useEffect(() => {
    getAllCoins()
      .then(coins => setAllCoins(coins))
      .catch(err => console.error(err));
  }, []);
  
  //~ filtered coins based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return allCoins;
    const query = searchQuery.toLowerCase().trim();
    return allCoins.filter(coin => 
      coin.name?.toLowerCase().includes(query) || 
      coin.symbol?.toLowerCase().includes(query) ||
      coin.id?.toLowerCase().includes(query)
    );
  }, [allCoins, searchQuery]);

  //~ fetch OHLC data for selected coin
  useEffect(() => {
    let active = true;
    setLoading(true);
    if (selectedCoins.length === 0) {
      setChartData(null);
      setLoading(false);
      return;
    }
    
    getCoinOHLC(selectedCoins[0], localCurrency, selectedDays)
      .then(data => {
        if (!active) return;
        
        if (!Array.isArray(data) || data.length === 0) {
          setChartData(null);
          return;
        }
        
        //~ pre-process data to ensure good visualization
        const processedData = data
          .map(candle => {
            //~ convert values to numbers & validate
            const timestamp = candle[0];
            const open = typeof candle[1] === 'number' ? candle[1] : parseFloat(candle[1]);
            const high = typeof candle[2] === 'number' ? candle[2] : parseFloat(candle[2]);
            const low = typeof candle[3] === 'number' ? candle[3] : parseFloat(candle[3]);
            const close = typeof candle[4] === 'number' ? candle[4] : parseFloat(candle[4]);
            
            //~ skip invalid points
            if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
              return null;
            }
            
            //~ ensure proper OHLC relationship
            const correctedHigh = Math.max(open, high, low, close);
            const correctedLow = Math.min(open, high, low, close);
            
            return [timestamp, open, correctedHigh, correctedLow, close];
          })
          .filter(candle => candle !== null);
        
        //~ find min/max values fr scaling
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        processedData.forEach(candle => {
          const [, open, high, low, close] = candle;
          minValue = Math.min(minValue, open, high, low, close);
          maxValue = Math.max(maxValue, open, high, low, close);
        });
        
        //~ ensure reasonable range for display
        if (minValue === maxValue) {
          const buffer = Math.max(minValue * 0.1, 1);
          minValue -= buffer;
          maxValue += buffer;
        }
        
        //~ build labels and format timestamps
        const labels = processedData.map(candle =>
          new Date(candle[0]).toLocaleString(undefined, {
            month: 'short', 
            day: 'numeric',
            hour: selectedDays <= 1 ? '2-digit' : undefined,
            minute: selectedDays <= 1 ? '2-digit' : undefined
          })
        );
        
        //~ datasets fr chart
        const datasets = [{
          label: selectedCoins[0].charAt(0).toUpperCase() + selectedCoins[0].slice(1),
          data: processedData,
          backgroundColor: 'rgba(0,0,0,0)',
          minValue,
          maxValue
        }];
        
        setChartData({ labels, datasets, minValue, maxValue });
        setLastUpdated(new Date());
      })
      .catch(err => { 
        if (active) setError(err); 
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedCoins, localCurrency, selectedDays]);

  //~ fetch supported currencies
  useEffect(() => {
    getSupportedVsCurrencies()
      .then(list => setSupportedCurrencies(list))
      .catch(err => console.error(err));
  }, []);
  
  //& filter common currencies once initial load
  const [filteredCurrenciesInitialized, setFilteredCurrenciesInitialized] = useState(false);
  
  useEffect(() => {
    if (supportedCurrencies.length > 0 && !filteredCurrenciesInitialized) {
      const commonCurrencies = ['usd', 'eur', 'jpy', 'gbp', 'btc', 'eth'];
      const filteredCurrencies = supportedCurrencies.filter(curr => 
        commonCurrencies.includes(curr.toLowerCase())
      );
      
      if (filteredCurrencies.length > 0) {
        setSupportedCurrencies(filteredCurrencies);
        setFilteredCurrenciesInitialized(true);
        
        //~ if current currency not in filtered list, switch to usd
        if (!filteredCurrencies.includes(localCurrency)) {
          setLocalCurrency('usd');
          setToast({ show: true, message: 'Switched to USD', variant: 'info' });
        }
      }
    }
  }, [supportedCurrencies, localCurrency, filteredCurrenciesInitialized]);

  //& chart options w dynamic min/max vals - memoize to prevent recreating every render
  const chartOptions = useMemo(() => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const coinName = selectedCoins[context.datasetIndex].charAt(0).toUpperCase() + selectedCoins[context.datasetIndex].slice(1);
              const idx = context.dataIndex;
              const candle = context.dataset.data[idx];
              if (!candle) return '';
              
              const [timestamp, open, high, low, close] = candle;
              const formatter = new Intl.NumberFormat('en', { 
                style: 'currency', 
                currency: localCurrency.toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              });
              
              return [
                `${coinName} - ${new Date(timestamp).toLocaleString()}`,
                `Open: ${formatter.format(open)}`,
                `High: ${formatter.format(high)}`,
                `Low: ${formatter.format(low)}`,
                `Close: ${formatter.format(close)}`
              ];
            },
            title: () => null
          }
        },
        candlestick: true
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxTicksLimit: 8,
            maxRotation: 0
          }
        },
        y: {
          position: 'right',
          beginAtZero: false,
          grace: '5%',
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('en', { 
                style: 'currency', 
                currency: localCurrency.toUpperCase(),
                notation: 'compact'
              }).format(value);
            }
          }
        }
      }
    };
    
    //~ set min and max for Y axis if available in chartData
    if (chartData && chartData.minValue !== undefined && chartData.maxValue !== undefined) {
      const range = chartData.maxValue - chartData.minValue;
      const paddedMin = Math.max(0, chartData.minValue - range * 0.1);
      const paddedMax = chartData.maxValue + range * 0.1;
      
      options.scales.y.min = paddedMin;
      options.scales.y.max = paddedMax;
    }
    
    return options;
  }, [chartData, localCurrency, selectedCoins]);

  return (
    <>
      <Card className="my-4 position-relative">
        <ToastContainer className="position-absolute top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <Toast 
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
            show={toast.show} 
            bg={toast.variant} 
            delay={3000} 
            autohide
          >
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
        <Card.Header>
          <Row className="align-items-center position-relative">
            <Col>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                <small className="mb-0">OHLC Chart</small>
              </div>
            </Col>
            <Form.Select 
              size="sm" 
              className="position-absolute top-50 start-50 translate-middle"
              value={localCurrency} 
              onChange={e => {
                const val = e.target.value;
                setLocalCurrency(val);
                setToast({ show: true, message: `Switched to ${val.toUpperCase()} successfully`, variant: 'success' });
              }} 
              style={{ width: '80px' }}
            >
              {supportedCurrencies.map(v => (
                <option key={v} value={v}>{v.toUpperCase()}</option>
              ))}
            </Form.Select>
            <Col xs="auto" className="text-end">
              <small className="text-muted">Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : '-'}</small>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 align-items-end">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="mb-1">Coin</Form.Label>
                <div className="d-flex mb-2">
                  <InputGroup className="w-100">
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <Form.Select
                  size="sm"
                  value={selectedCoins[0]}
                  onChange={(e) => {
                    //~ update the selected coin
                    setSelectedCoins([e.target.value]);
                    setToast({ show: true, message: `Selected ${e.target.options[e.target.selectedIndex].text}`, variant: 'success' });
                  }}
                  className="w-100"
                  style={{ height: '38px' }}
                >
                  {filteredCoins.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol.toUpperCase()})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex justify-content-md-end pb-2">
              <div>
                <span className="me-2">Time Period:</span>
                <ButtonGroup size="sm">
                  {daysOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={selectedDays === option.value ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedDays(option.value)}
                      className="px-3"
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </Col>
          </Row>
          
          {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
          {error && <p className="text-danger">Failed to load OHLC data.</p>}
          
          {!loading && !error && chartData && (
            <div style={{ height: '300px' }}>
              <ReactChart 
                type="bar" 
                options={chartOptions} 
                data={chartData} 
                plugins={[candlestickPlugin]} 
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

OHLCChart.propTypes = {
  currency: PropTypes.string
};

//& export memoized component prevent unnecessary re-renders
export default React.memo(OHLCChart);
