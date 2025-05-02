import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Spinner, Alert, Form, ToastContainer, Toast, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getGlobalData } from '../../services/service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import './GlobalStats.css';

//& global stats component show mkt overview data
export default function GlobalStats({ currency, setCurrency, vsCurrencies }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    getGlobalData()
      .then(d => setData(d))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  //~ supported currencies once data loaded (memoized)
  const availableCurrencies = useMemo(() => {
    return data?.total_market_cap
      ? vsCurrencies.filter(v => Object.hasOwn(data.total_market_cap, v))
      : [];
  }, [data, vsCurrencies]);

  //~ error if selected currency unsupported
  useEffect(() => {
    if (availableCurrencies.length === 0) return;
    if (!availableCurrencies.includes(currency)) {
      setToast({ show: true, variant: 'danger', message: `Currency ${currency.toUpperCase()} not supported, defaulting to USD` });
      setCurrency('usd');
    }
  }, [availableCurrencies, currency, setCurrency]);

  //~ formatting fallback for unsupported intl currencies
  useEffect(() => {
    try {
      new Intl.NumberFormat('en', { style: 'currency', currency: currency.toUpperCase() });
    } catch {
      setToast({ show: true, variant: 'danger', message: `Currency ${currency.toUpperCase()} not supported, defaulting to USD` });
      setCurrency('usd');
    }
  }, [currency]);

  if (loading) return <div className="text-center py-3"><Spinner /></div>;
  if (error || !data) return <Alert variant="danger">Failed to load global stats.</Alert>;

  const { total_market_cap, total_volume, market_cap_percentage, market_cap_change_percentage_24h_usd, active_cryptocurrencies, markets, upcoming_icos, ongoing_icos, ended_icos, updated_at } = data;
  //~ compute formatted update time & supported curr
  const formattedUpdatedAt = updated_at ? new Date(updated_at * 1000).toLocaleString() : '-';
  //~ formatter w err handling
  let fmt;
  try {
    fmt = new Intl.NumberFormat('en', { style: 'currency', currency: currency.toUpperCase() });
  } catch {
    console.warn('Invalid currency code for formatting:', currency);
    fmt = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });
  }
  const marketCap = fmt.format(total_market_cap[currency] ?? 0);
  const volume = fmt.format(total_volume[currency] ?? 0);

  return (
    <Card className="mb-4 position-relative">
      <Card.Header>
        <Row className="align-items-center position-relative justify-content-between">
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faChartPie} className="me-2" />
              <small>Global Stats</small>
            </div>
          </Col>
          <Form.Select size="sm" className="position-absolute top-50 start-50 translate-middle" style={{ width: '5rem' }} value={currency} onChange={e => {
            const val = e.target.value;
            if (availableCurrencies.includes(val)) {
              setCurrency(val);
              setToast({ show: true, message: `Switched to ${val.toUpperCase()} successfully`, variant: 'success' });
            } else {
              setCurrency('usd');
              setToast({ show: true, message: `Currency ${val.toUpperCase()} not supported, defaulting to USD`, variant: 'danger' });
            }
          }}>
            {availableCurrencies.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
          </Form.Select>
          <Col xs="auto" className="text-end">
            <small className="text-muted">Last Updated: {formattedUpdatedAt}</small>
          </Col>
        </Row>
      </Card.Header>
      <ToastContainer className="position-absolute top-0 end-0 p-3">
        <Toast onClose={() => setToast(prev => ({ ...prev, show: false }))} show={toast.show} bg={toast.variant} delay={3000} autohide>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Card.Body>
        <Row className="g-3 justify-content-start flex-wrap">
          <Col xs="auto">
            <OverlayTrigger placement="top" trigger={["hover","focus"]} overlay={<Tooltip id="tooltip-marketcap">Total market capitalization (sum of every coin’s market cap)</Tooltip>} container={document.body}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>Market Cap</h6>
                  <p>{marketCap}</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-volume">Combined 24-hour trading volume across all markets</Tooltip>}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>24h Volume</h6>
                  <p>{volume}</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-marketcap24h">Changes in global market cap over the last 24 hours</Tooltip>}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>Market Cap (24h)</h6>
                  <p className={market_cap_change_percentage_24h_usd >= 0 ? 'text-success' : 'text-danger'}>
                    {market_cap_change_percentage_24h_usd?.toFixed(2)}%
                  </p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-active">Count of all cryptocurrencies currently tracked</Tooltip>}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>Active Cryptos</h6>
                  <p>{active_cryptocurrencies.toLocaleString()}</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" trigger={["hover","focus"]} overlay={<Tooltip id="tooltip-btc">Bitcoin’s share of total market cap</Tooltip>} container={document.body}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>MKT Share (BTC)</h6>
                  <p>{market_cap_percentage.btc.toFixed(2)}%</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-eth">Ethereum’s share of total market cap</Tooltip>}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>MKT Share (ETH)</h6>
                  <p>{market_cap_percentage.eth.toFixed(2)}%</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" trigger={["hover","focus"]} overlay={<Tooltip id="tooltip-markets">Total number of trading pairs (exchanges × coins) across the entire ecosystem</Tooltip>} container={document.body}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>Markets</h6>
                  <p>{markets.toLocaleString()}</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <OverlayTrigger placement="top" trigger={["hover","focus"]} overlay={<Tooltip id="tooltip-ico">Counts of Upcoming, Ongoing and ended Initial Coin Offerings (ICOs)</Tooltip>} container={document.body}>
              <Card className="text-center stat-card">
                <Card.Body>
                  <h6>ICO Stats</h6>
                  <p>Upcoming: {upcoming_icos}, Ongoing: {ongoing_icos}, Ended: {ended_icos}</p>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

GlobalStats.propTypes = {
  currency: PropTypes.string.isRequired,
  setCurrency: PropTypes.func.isRequired,
  vsCurrencies: PropTypes.arrayOf(PropTypes.string).isRequired,
};
