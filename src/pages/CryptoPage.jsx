import './CryptoPage.css';
import { Container, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import useCrypto from '../hooks/useCrypto';
import { useState, useEffect } from 'react';
import { getSupportedVsCurrencies } from '../services/service';

//^ crypto components
import GlobalStats from './crypto/GlobalStats';
import TrendingBar from './crypto/TrendingBar';
import AllCoins from './crypto/AllCoins';
import GainersLosers from './crypto/GainersLosers';
import VolumeLeaders from './crypto/VolumeLeaders';
import PriceHistoryChart from './crypto/PriceHistoryChart';
import OHLCChart from './crypto/OHLCChart';
import CoinTickers from './crypto/CoinTickers';
import TokenPrices from './crypto/TokenPrices';

//& Crypto pg: mkt overview
export default function CryptoPage() {
  const [globalCurrency, setGlobalCurrency] = useState('usd');
  const [pageCurrency, setPageCurrency] = useState('usd');
  const [vsCurrencies, setVsCurrencies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pageToast, setPageToast] = useState({ show: false, message: '', variant: 'success' });
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
      <GlobalStats currency={globalCurrency} setCurrency={setGlobalCurrency} vsCurrencies={vsCurrencies} />
      <TrendingBar />
      
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
      
      <Row className="my-4">
        <Col>
          <CoinTickers currency={pageCurrency} />
        </Col>
      </Row>
      
      <TokenPrices currency={pageCurrency} />
      
      <AllCoins
        vsCurrencies={vsCurrencies}
        pageCurrency={pageCurrency}
        setPageCurrency={setPageCurrency}
        lastUpdated={lastUpdated}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        coins={coins}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        pageToast={pageToast}
        setPageToast={setPageToast}
        totalPages={totalPages}
        formatLargeNumber={formatLargeNumber}
      />
      
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setPageToast(prev => ({ ...prev, show: false }))} show={pageToast.show} bg={pageToast.variant} delay={3000} autohide>
          <Toast.Body>{pageToast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}