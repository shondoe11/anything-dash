import './CryptoPage.css';
import { Container, Row, Col, ToastContainer, Toast, Nav, Tab } from 'react-bootstrap';
import useCrypto from '../hooks/useCrypto';
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { getSupportedVsCurrencies } from '../services/service';
import { throttle, debounce } from './crypto/optimizeRender';

//^ crypto components
//& lazy loaded crypto components fr better performance
import GlobalStats from './crypto/GlobalStats';
import TrendingBar from './crypto/TrendingBar';

//& lazily load heavier components 
const AllCoins = lazy(() => import('./crypto/AllCoins'));
const GainersLosers = lazy(() => import('./crypto/GainersLosers'));
const VolumeLeaders = lazy(() => import('./crypto/VolumeLeaders'));
const PriceHistoryChart = lazy(() => import('./crypto/PriceHistoryChart'));
const OHLCChart = lazy(() => import('./crypto/OHLCChart'));
const CoinTickers = lazy(() => import('./crypto/CoinTickers'));
const TokenPrices = lazy(() => import('./crypto/TokenPrices'));

//& Crypto pg: mkt overview
export default function CryptoPage() {
  //~rack active tab prevent unnecessary renders
  const [activeTab, setActiveTab] = useState('overview');
  
  //& state mgmt
  const [globalCurrency, setGlobalCurrency] = useState('usd');
  const [pageCurrency, setPageCurrency] = useState('usd');
  const [vsCurrencies, setVsCurrencies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pageToast, setPageToast] = useState({ show: false, message: '', variant: 'success' });
  
  //~ performance optimized currency updater
  const throttledSetPageCurrency = useRef(
    throttle((val) => {
      setPageCurrency(val);
    }, 200)
  ).current;
  
  //~ debounced toast msg prevent rapid UI updates
  const debouncedSetToast = useRef(
    debounce((message, variant) => {
      setPageToast({ show: true, message, variant });
    }, 300)
  ).current;
  
  //~ load currencies on component mount
  useEffect(() => {
    getSupportedVsCurrencies().then(setVsCurrencies).catch(console.error);
  }, []);
  
  const { coins, loading, error, page, setPage, searchQuery, setSearchQuery } = useCrypto(pageCurrency);
  const totalPages = 100;
  useEffect(() => {
    if (!loading && !error) setLastUpdated(new Date());
  }, [coins, loading, error]);

  const formatLargeNumber = num => {
    if (num >= 1e12) return `${(num/1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num/1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num/1e6).toFixed(2)}M`;
    return num?.toLocaleString() ?? '-';
  };

  return (
    <Container className="crypto-page my-4">
      <h1 className="mb-4">Cryptocurrencies</h1>
      
      {/* Main market stats always visible */}
      <GlobalStats currency={globalCurrency} setCurrency={setGlobalCurrency} vsCurrencies={vsCurrencies} />
      <TrendingBar />
      
      {/* Tab-based UI to lazy load heavy components & reduce initial load */}
      <Tab.Container 
        id="crypto-tabs" 
        defaultActiveKey="overview"
        onSelect={(key) => setActiveTab(key)}
        activeKey={activeTab}
      >
        <Row className="my-4">
          <Col>
            <Nav variant="tabs" className="crypto-nav mb-3">
              <Nav.Item>
                <Nav.Link eventKey="overview">Market Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="charts">Charts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="trading">Trading</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="coins">All Coins</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Tab.Content>
              {/* Market Overview Tab */}
              <Tab.Pane eventKey="overview">
                {activeTab === 'overview' && (
                  <Suspense fallback={<div className="text-center py-5"><span className="spinner-border text-primary"></span></div>}>
                    <Row className="my-4">
                      <Col>
                        <GainersLosers currency={pageCurrency} />
                      </Col>
                    </Row>
                    <Row className="my-4">
                      <Col>
                        <VolumeLeaders currency={pageCurrency} />
                      </Col>
                    </Row>
                  </Suspense>
                )}
              </Tab.Pane>
              
              {/* Charts Tab */}
              <Tab.Pane eventKey="charts">
                {activeTab === 'charts' && (
                  <Suspense fallback={<div className="text-center py-5"><span className="spinner-border text-primary"></span></div>}>
                    <Row className="my-4">
                      <Col>
                        <PriceHistoryChart currency={pageCurrency} />
                      </Col>
                    </Row>
                    <Row className="my-4">
                      <Col>
                        <OHLCChart currency={pageCurrency} />
                      </Col>
                    </Row>
                  </Suspense>
                )}
              </Tab.Pane>
              
              {/* Trading Tab */}
              <Tab.Pane eventKey="trading">
                {activeTab === 'trading' && (
                  <Suspense fallback={<div className="text-center py-5"><span className="spinner-border text-primary"></span></div>}>
                    <Row className="my-4">
                      <Col>
                        <CoinTickers currency={pageCurrency} />
                      </Col>
                    </Row>
                    <TokenPrices currency={pageCurrency} />
                  </Suspense>
                )}
              </Tab.Pane>
              
              {/* All Coins Tab */}
              <Tab.Pane eventKey="coins">
                {activeTab === 'coins' && (
                  <Suspense fallback={<div className="text-center py-5"><span className="spinner-border text-primary"></span></div>}>
                    <AllCoins
                      vsCurrencies={vsCurrencies}
                      pageCurrency={pageCurrency}
                      setPageCurrency={throttledSetPageCurrency}
                      lastUpdated={lastUpdated}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      coins={coins}
                      loading={loading}
                      error={error}
                      page={page}
                      setPage={setPage}
                      pageToast={pageToast}
                      setPageToast={(toastData) => debouncedSetToast(toastData.message, toastData.variant)}
                      totalPages={totalPages}
                      formatLargeNumber={formatLargeNumber}
                    />
                  </Suspense>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setPageToast(prev => ({ ...prev, show: false }))} show={pageToast.show} bg={pageToast.variant} delay={3000} autohide>
          <Toast.Body>{pageToast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}