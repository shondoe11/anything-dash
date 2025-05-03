import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Row, Col, Spinner, Form, ButtonGroup, Button, ToastContainer, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { getTokenPrices, getSupportedVsCurrencies, getAssetPlatforms } from '../../services/service';

//& token prices by platform
export default function TokenPrices({ currency = 'usd' }) {
  const [selectedPlatform, setSelectedPlatform] = useState('ethereum');
  const [tokenPrices, setTokenPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [assetPlatforms, setAssetPlatforms] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  
  //& sample token addresses fr each platform - wrapped in useMemo to prevent recreation on each render
  const tokenAddressesByPlatform = useMemo(() => ({
    'ethereum': {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
      '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI',
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'AAVE'
    },
    'binance-smart-chain': {
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'USDC',
      '0x55d398326f99059ff775485246999027b3197955': 'USDT',
      '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
      '0x7083609fce4d1d8dc0c979aab8c869ea2c873402': 'DOT'
    },
    'polygon-pos': {
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': 'WMATIC',
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'USDC',
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': 'WETH',
      '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': 'WBTC',
      '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a': 'SUSHI'
    },
    'avalanche': {
      '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': 'WAVAX',
      '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664': 'USDC',
      '0xc7198437980c041c805a1edcba50c1ce5db95118': 'USDT.e',
      '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab': 'WETH.e',
      '0x60781c2586d68229fde47564546784ab3faca982': 'PNG'
    },
    'solana': {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'BTC',
      '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ETH'
    },
    'optimistic-ethereum': {
      '0x4200000000000000000000000000000000000006': 'WETH',
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607': 'USDC',
      '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT',
      '0x68f180fcce6836688e9084f035309e29bf0a2095': 'WBTC',
      '0x4200000000000000000000000000000000000042': 'OP'
    },
    'arbitrum-one': {
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': 'WETH',
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': 'USDC',
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': 'WBTC',
      '0x912ce59144191c1204e64559fe8253a0e49e6548': 'ARB'
    },
    'fantom': {
      '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83': 'WFTM',
      '0x04068da6c83afcfa0e13ba15a6696662335d5b75': 'USDC',
      '0x049d68029688eabf473097a2fc38ef61633a3c7a': 'fUSDT',
      '0x321162cd933e2be498cd2267a90534a804051b11': 'WBTC',
      '0x74b23882a30290451a17c44f4f05243b6b58c76d': 'WETH'
    }
  }), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    const addresses = tokenAddressesByPlatform[selectedPlatform] || {};
    
    getTokenPrices(selectedPlatform, addresses, localCurrency)
      .then(data => { if (active) { setTokenPrices(data); setLastUpdated(new Date()); } })
      .catch(err => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [selectedPlatform, localCurrency, tokenAddressesByPlatform]);

  useEffect(() => {
    getSupportedVsCurrencies()
      .then(list => setSupportedCurrencies(list))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    getAssetPlatforms()
      .then(list => setAssetPlatforms(list))
      .catch(err => console.error(err));
  }, []);

  //~ format price w currency symbol
  const formatPrice = (price) => {
    if (!price) return '-';
    
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

  //& additional formatters fr metrics
  const formatVolume = (val) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(val || 0);
  const formatPercent = (val) => {
    if (val == null) return '-';
    const color = val >= 0 ? 'success' : 'danger';
    const prefix = val > 0 ? '+' : '';
    return <span className={`text-${color}`}>{prefix}{val.toFixed(2)}%</span>;
  };

  //& dynamic platform options based on static tokenAddressesByPlatform keys
  const platformOptions = useMemo(() =>
    Object.keys(tokenAddressesByPlatform).map(id => {
      const plat = assetPlatforms.find(p => p.id === id);
      return { value: id, label: plat?.name || id };
    })
  , [assetPlatforms, tokenAddressesByPlatform]);

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
                <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                <small className="mb-0">Token Prices by Platform</small>
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
            <Col>
              <Form.Label className="mb-1">Platform</Form.Label>
              <div>
                <ButtonGroup size="sm">
                  {platformOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={selectedPlatform === option.value ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setSelectedPlatform(option.value);
                        setToast({ show: true, message: `Switched to ${option.label}`, variant: 'success' });
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </Col>
          </Row>
          
          {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
          {error && <p className="text-danger">Failed to load token price data.</p>}
          
          {!loading && !error && Object.keys(tokenPrices).length > 0 && (
            <Table hover responsive size="sm" className="rounded crypto-table">
              <colgroup>{/* rm whitespace between tags */}
                <col style={{ width: '12%' }} />{/* Token */}
                <col style={{ width: '25%' }} />{/* Address */}
                <col style={{ width: '15%' }} />{/* Price */}
                <col style={{ width: '18%' }} />{/* Market Cap */}
                <col style={{ width: '15%' }} />{/* 24h Volume */}
                <col style={{ width: '15%' }} />{/* 24h Change */}
              </colgroup>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Address</th>
                  <th>Price ({localCurrency.toUpperCase()})</th>
                  <th>Market Cap ({localCurrency.toUpperCase()})</th>
                  <th>24h Volume</th>
                  <th>24h Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tokenPrices).map(([address, priceData]) => (
                  <tr key={address}>
                    <td>{tokenAddressesByPlatform[selectedPlatform][address]}</td>
                    <td>
                      <small className="text-muted" style={{ wordBreak: 'break-all' }}>
                        {address}
                      </small>
                    </td>
                    <td>{formatPrice(priceData[localCurrency])}</td>
                    <td>{formatPrice(priceData[`${localCurrency}_market_cap`])}</td>
                    <td>{formatVolume(priceData[`${localCurrency}_24h_vol`])}</td>
                    <td>{formatPercent(priceData[`${localCurrency}_24h_change`])}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          {!loading && !error && Object.keys(tokenPrices).length === 0 && (
            <p className="text-center">No token price data available for this platform.</p>
          )}
        </Card.Body>
      </Card>

    </>
  );
}

TokenPrices.propTypes = {
  currency: PropTypes.string
};
