import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Row, Col, Spinner, Form, Pagination, ToastContainer, Toast, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { getCoinTickers, getSupportedVsCurrencies } from '../../services/service';

//& display coin tickers & trading pairs
export default function CoinTickers({ currency = 'usd' }) {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [tickers, setTickers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  //& toast on rate-limit err
  useEffect(() => {
    if (error && error.message.includes('Rate Limit Exceeded')) {
      setToast({ show: true, message: error.message, variant: 'danger' });
    }
  }, [error]);

  //& common coins selection
  const coinOptions = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)' },
    { value: 'ethereum', label: 'Ethereum (ETH)' },
    { value: 'ripple', label: 'XRP' },
    { value: 'cardano', label: 'Cardano (ADA)' },
    { value: 'solana', label: 'Solana (SOL)' }
  ];

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    getCoinTickers(selectedCoin, 1)
      .then(data => { 
        if (active) { setTickers(data); setLastUpdated(new Date()); }
      })
      .catch(err => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [selectedCoin]);

  useEffect(() => {
    getSupportedVsCurrencies()
      .then(data => setSupportedCurrencies(data))
      .catch(err => console.error(err));
  }, []);
  
  //& track currency initialization status
  const [currenciesInitialized, setCurrenciesInitialized] = useState(false);
  const [tickerCurrenciesInitialized, setTickerCurrenciesInitialized] = useState(false);
  
  //& limit currency options to prevent rate limit issues
  useEffect(() => {
    //~ only run 1x whn supportedCurrencies first loaded
    if (supportedCurrencies.length > 0 && !currenciesInitialized) {
      //& manually filter to common currencies known to work well
      const commonCurrencies = ['usd', 'eur', 'jpy', 'gbp', 'btc', 'eth'];
      const filteredCurrencies = supportedCurrencies.filter(curr => 
        commonCurrencies.includes(curr.toLowerCase())
      );
      
      if (filteredCurrencies.length > 0) {
        setSupportedCurrencies(filteredCurrencies);
        setCurrenciesInitialized(true);
        
        //~ if current currency not in filtered list, switch to usd
        if (!filteredCurrencies.includes(localCurrency)) {
          setLocalCurrency('usd');
          setToast({ show: true, message: 'Switched to USD', variant: 'info' });
        }
      }
    }
  }, [supportedCurrencies, localCurrency, currenciesInitialized]);
  
  //& further filter currencies based on ticker data
  useEffect(() => {
    //~ only run whn tickers first load & aft initial currency filtering
    if (tickers.length > 0 && supportedCurrencies.length > 0 && currenciesInitialized && !tickerCurrenciesInitialized) {
      const tickerCurrencies = [...new Set(tickers.map(t => t.target?.toLowerCase()))];
      const validCurrencies = supportedCurrencies.filter(c => 
        tickerCurrencies.includes(c.toLowerCase())
      );
      
      if (validCurrencies.length > 0) {
        setSupportedCurrencies(validCurrencies);
        setTickerCurrenciesInitialized(true);
      }
    }
  }, [tickers, supportedCurrencies, currenciesInitialized, tickerCurrenciesInitialized]);

  //& calculate pagination
  const filteredTickers = useMemo(
    () => tickers.filter(t => t.target.toLowerCase() === localCurrency.toLowerCase()),
    [tickers, localCurrency]
  );
  const totalPages = Math.ceil(filteredTickers.length / itemsPerPage);
  const currentItems = filteredTickers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //& format volume as currency
  const formatVolume = (volume) => {
    if (volume >= 1e12) return `${(volume/1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `${(volume/1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume/1e6).toFixed(2)}M`;
    return volume?.toLocaleString() ?? '-';
  };

  //& format percentage w color
  const formatPercentage = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    const color = num >= 0 ? 'success' : 'danger';
    const prefix = num > 0 ? '+' : '';
    return <span className={`text-${color}`}>{prefix}{num.toFixed(2)}%</span>;
  };

  return (
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
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
              <small className="mb-0">Coin Tickers & Trading Pairs</small>
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
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="mb-1">Coin</Form.Label>
              <Form.Select 
                size="sm" 
                value={selectedCoin}
                onChange={(e) => {
                  setSelectedCoin(e.target.value);
                  setCurrentPage(1);
                  setToast({ show: true, message: `Selected ${e.target.options[e.target.selectedIndex].text}`, variant: 'success' });
                }}
                style={{ maxWidth: '240px' }}
              >
                {coinOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
        {error && <p className="text-danger">Failed to load ticker data.</p>}
        
        {!loading && !error && currentItems.length > 0 && (
          <>
            <Table hover responsive size="sm" className="rounded crypto-table">
              <thead>
                <tr>
                  <th>Exchange</th>
                  <th>Pair</th>
                  <th>Price</th>
                  <th>
                    Spread
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-spread">Bid-ask spread percentage represents the difference between the highest price a buyer is willing to pay and the lowest price a seller is willing to accept. Lower values indicate higher liquidity.</Tooltip>}
                    >
                      <span className="ms-1">
                        <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                      </span>
                    </OverlayTrigger>
                  </th>
                  <th>24h Volume</th>
                  <th>Last Traded</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((ticker, index) => (
                  <tr key={index}>
                    <td>{ticker.market.name}</td>
                    <td>{ticker.base}/{ticker.target}</td>
                    <td>
                      {new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: localCurrency.toUpperCase(), 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      }).format(ticker.last)}
                    </td>
                    <td>{formatPercentage(ticker.bid_ask_spread_percentage)}</td>
                    <td>{formatVolume(ticker.volume)}</td>
                    <td>
                      {ticker.last_traded_at
                        ? new Date(ticker.last_traded_at).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {totalPages > 1 && (
              <Pagination className="justify-content-center mt-3">
                <Pagination.First 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }
                  
                  return (
                    <Pagination.Item 
                      key={idx} 
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            )}
          </>
        )}
        
        {!loading && !error && currentItems.length === 0 && (
          <p className="text-center">No ticker data available for this coin.</p>
        )}
        

      </Card.Body>
    </Card>
  );
}

CoinTickers.propTypes = {
  currency: PropTypes.string
};
