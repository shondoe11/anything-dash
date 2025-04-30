//& custom hook fr crypto market data
import { useState, useEffect } from 'react';
import { fetchCoinGeckoData } from '../services/service';

export default function useCrypto(currency = 'sgd', initialPage = 1) {
  //~ currency pass as param
  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const handler = setTimeout(() => {
      fetchCoinGeckoData(currency, page, searchQuery)
        .then(data => { if (active) setCoins(data); })
        .catch(err => { if (active) setError(err); })
        .finally(() => { if (active) setLoading(false); });
    }, 500);
    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [currency, page, searchQuery]);

  return { coins, loading, error, page, setPage, searchQuery, setSearchQuery };
}
