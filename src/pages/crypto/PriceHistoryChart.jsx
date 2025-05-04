import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Spinner, Button, Form, ToastContainer, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartArea, faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { getCoinMarketChart, getSupportedVsCurrencies, getAllCoins } from '../../services/service';

//^ Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

//& price history chart
export default function PriceHistoryChart({ currency = 'usd' }) {
  const [selectedCoins, setSelectedCoins] = useState([]);
  const [selectedDays, setSelectedDays] = useState(1);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
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
  
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    
    //~ reset chart data if no coins selected
    if (selectedCoins.length === 0) {
      setChartData(null);
      setLoading(false);
      return;
    }
    
    Promise.all(selectedCoins.map(coin => 
      getCoinMarketChart(coin, localCurrency, selectedDays)
        .catch(err => {
          console.error(`Failed to fetch chart data for ${coin}:`, err);
          return null;
        })
    ))
    .then(results => {
      if (!active) return;
      
      //~ filter null results & log warnings
      const validResults = results.filter(result => result !== null);
      
      if (validResults.length === 0) {
        setError(new Error('No valid chart data found'));
        return;
      }
      
      const chartDatasets = validResults.map((d, i) => {
        const prices = d.prices || [];
        if (prices.length > 0) {
          const priceValues = prices.map(price => price[1]);
          
          return {
            label: `${selectedCoins[i].charAt(0).toUpperCase() + selectedCoins[i].slice(1)} Price`,
            data: priceValues,
            borderColor: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
            backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`,
            tension: 0.1,
            pointRadius: selectedDays === 1 ? 0 : 1,
            borderWidth: 2,
            fill: true
          };
        }
      }).filter(Boolean);
      
      if (chartDatasets.length === 0) {
        setError(new Error('Unable to process chart data'));
        return;
      }
      
      setChartData({
        labels: validResults[0].prices.map(price => new Date(price[0]).toLocaleString()),
        datasets: chartDatasets
      });
      setLastUpdated(new Date());
    })
    .catch(err => {
      if (active) {
        console.error('Unexpected error in chart data fetching:', err);
        setError(err);
      }
    })
    .finally(() => {
      if (active) setLoading(false);
    });
    
    return () => { active = false; };
  }, [selectedCoins, localCurrency, selectedDays]);

  useEffect(() => {
    getSupportedVsCurrencies()
      .then(list => setSupportedCurrencies(list))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    getAllCoins()
      .then(coins => setAllCoins(coins))
      .catch(err => console.error(err));
  }, []);
  
  //& filtered coins based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return allCoins;
    const query = searchQuery.toLowerCase().trim();
    return allCoins.filter(coin => 
      coin.name.toLowerCase().includes(query) || 
      coin.symbol.toLowerCase().includes(query) ||
      coin.id.toLowerCase().includes(query)
    );
  }, [allCoins, searchQuery]);

  //& chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        intersect: false,
        mode: 'index',
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en', { 
                style: 'currency', 
                currency: localCurrency.toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
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
                <FontAwesomeIcon icon={faChartArea} className="me-2" />
                <small className="mb-0">Price History Chart</small>
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
          <Row className="mb-3 align-items-center">
            <Col xs={12} md={8} className="mb-2 mb-md-0">
              <Form.Group>
                <Form.Label className="mb-1">Select Coins (max 3)</Form.Label>
                <div className="d-flex mb-2">
                  <InputGroup className="me-2" style={{ flex: '2' }}>
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
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedCoins([]);
                      setToast({ show: true, message: 'Cleared all selected coins', variant: 'info' });
                    }}
                    style={{ flex: '1' }}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Clear Selected
                  </Button>
                </div>
                <div className="d-flex">
                  <Form.Select
                    multiple
                    value={selectedCoins}
                    onClick={(e) => {
                      //~ allow clicking select/deselect w/o holding shift
                      if (e.target.tagName === 'OPTION') {
                        e.preventDefault();
                        const clickedValue = e.target.value;
                        const newSelection = [...selectedCoins];
                        
                        if (newSelection.includes(clickedValue)) {
                          //~ remove if alr selected
                          const index = newSelection.indexOf(clickedValue);
                          newSelection.splice(index, 1);
                        } else {
                          //~ add if nt alr selected (max 3)
                          if (newSelection.length < 3) {
                            newSelection.push(clickedValue);
                          } else {
                            setToast({ show: true, message: 'Maximum 3 coins can be selected', variant: 'warning' });
                            return;
                          }
                        }
                        
                        setSelectedCoins(newSelection);
                        setToast({ show: true, message: `Selected ${newSelection.length} coin(s)`, variant: 'success' });
                      }
                    }}
                    onChange={() => {}} //~ keep empty prevent default behavior
                    className="w-100"
                    style={{ height: '150px' }}
                  >
                    {filteredCoins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col xs={12} md={4} className="d-flex align-items-end justify-content-md-end pb-2">
              <div style={{ marginTop: '195px' }}>
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
          {error && <p className="text-danger">Failed to load chart data.</p>}
          

          
          {!loading && !error && chartData && (
            <div style={{ height: '300px' }}>
              <Line options={chartOptions} data={chartData} />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

PriceHistoryChart.propTypes = {
  currency: PropTypes.string
};
