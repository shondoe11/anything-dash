import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Row, Col, Spinner, Form, ToastContainer, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { getVolumeLeaders, getSupportedVsCurrencies } from '../../services/service';

export default function VolumeLeaders({ currency = 'usd' }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    getVolumeLeaders(localCurrency)
      .then(data => { if (active) { setCoins(data); setLastUpdated(data.length ? new Date(data[0].last_updated) : new Date()); } })
      .catch(err => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [localCurrency]);

  useEffect(() => {
    getSupportedVsCurrencies()
      .then(list => setSupportedCurrencies(list))
      .catch(err => console.error(err));
  }, []);

  const formatLargeNumber = num => {
    if (num >= 1e12) return `${(num/1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num/1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num/1e6).toFixed(2)}M`;
    return num?.toLocaleString() ?? '-';
  };

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('en', { 
        style: 'currency', 
        currency: localCurrency.toUpperCase(),
        maximumFractionDigits: 8
      }).format(price);
    } catch {
      return `${price} ${localCurrency.toUpperCase()}`;
    }
  };

  return (
    <>
      <Card className="my-4 position-relative">
        <Card.Header>
          <Row className="align-items-center position-relative">
            <Col>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                <small className="mb-0">Volume Leaders (24h)</small>
              </div>
            </Col>
            <Form.Select
              size="sm"
              className="position-absolute top-50 start-50 translate-middle"
              style={{ width: '5rem' }}
              value={localCurrency}
              onChange={e => {
                const val = e.target.value;
                setLocalCurrency(val);
                setToast({ show: true, message: `Switched to ${val.toUpperCase()} successfully`, variant: 'success' });
              }}
            >
              {supportedCurrencies.map(v => (
                <option key={v} value={v}>{v.toUpperCase()}</option>
              ))}
            </Form.Select>
            <Col xs="auto" className="text-end">
              <small className="text-muted">Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : '-'}</small>
            </Col>
          </Row>
          <ToastContainer className="position-absolute top-0 end-0 p-3">
            <Toast onClose={() => setToast(prev => ({ ...prev, show: false }))} show={toast.show} bg={toast.variant} delay={3000} autohide>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          </ToastContainer>
        </Card.Header>
        <Card.Body>
          {loading && <div className="text-center py-2"><Spinner animation="border" size="sm" /></div>}
          {error && <p className="text-danger">Failed to load volume leaders data.</p>}
          
          {!loading && !error && (
            <Table hover responsive size="sm" className="rounded crypto-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h Volume</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {coins.map(coin => (
                  <tr key={coin.id}>
                    <td>{coin.market_cap_rank}</td>
                    <td>
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        width="16" 
                        height="16" 
                        className="me-2" 
                      />
                      {coin.symbol.toUpperCase()}
                    </td>
                    <td>{formatPrice(coin.current_price)}</td>
                    <td>{formatLargeNumber(coin.total_volume)}</td>
                    <td>{formatLargeNumber(coin.market_cap)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

VolumeLeaders.propTypes = {
  currency: PropTypes.string
};
