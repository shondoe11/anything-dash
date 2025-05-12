import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Row, Col, Spinner, Form, ToastContainer, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import { getMarketOverview } from '../../services/service';
import useSupportedVsCurrencies from '../../hooks/useSupportedVsCurrencies';

//& display top gainers & losers in 24h
export default function GainersLosers({ currency = 'usd' }) {
  const [data, setData] = useState({ gainers: [], losers: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const supportedCurrencies = useSupportedVsCurrencies();
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMarketOverview(localCurrency, 100, 10)
      .then(({ gainers, losers }) => {
        if (active) {
          setData({ gainers, losers });
          setLastUpdated(new Date());
        }
      })
      .catch(err => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [localCurrency]);

  //& rate-limit err toast
  useEffect(() => {
    if (error && error.message.includes('Rate Limit Exceeded')) {
      setToast({ show: true, message: error.message, variant: 'danger' });
    }
  }, [error]);

  //& helper function format price w currency symbol
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
    <Card className="my-4 position-relative">
      <Card.Header>
        <Row className="align-items-center position-relative">
          <Col>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faTrophy} className="me-2" />
              <small className="mb-0">Top 10 Gainers & Losers (24h)</small>
            </div>
          </Col>
          <Form.Select size="sm" className="position-absolute top-50 start-50 translate-middle" style={{ width: '5rem' }} value={localCurrency} onChange={e => {
              const val = e.target.value;
              setLocalCurrency(val);
              setToast({ show: true, message: `Switched to ${val.toUpperCase()} successfully`, variant: 'success' });
          }}>
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
        {error && <p className="text-danger">Failed to load gainers/losers data.</p>}
        
        {!loading && !error && (
          <Row>
            <Col md={6}>
              <h6 className="text-success mb-3">
                <FontAwesomeIcon icon={faArrowTrendDown} className="me-2" />
                Top Gainers
              </h6>
              <Table hover responsive size="sm" className="rounded crypto-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>24h %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gainers.map(coin => (
                    <tr key={coin.id}>
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
                      <td className="text-success">
                        +{coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h6 className="text-danger mb-3">
                <FontAwesomeIcon icon={faArrowTrendDown} className="me-2" />
                Top Losers
              </h6>
              <Table hover responsive size="sm" className="rounded crypto-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>24h %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.losers.map(coin => (
                    <tr key={coin.id}>
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
                      <td className="text-danger">
                        {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

GainersLosers.propTypes = {
  currency: PropTypes.string
};
