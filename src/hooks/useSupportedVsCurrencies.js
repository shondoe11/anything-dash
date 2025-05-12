import { useState, useEffect } from 'react';
import { getSupportedVsCurrencies } from '../services/service';

//& custom hook: share supported vs currencies across components
let supportedPromise;
export default function useSupportedVsCurrencies() {
  const [currencies, setCurrencies] = useState([]);
  useEffect(() => {
    if (!supportedPromise) {
      supportedPromise = getSupportedVsCurrencies();
    }
    supportedPromise
      .then(list => setCurrencies(list))
      .catch(err => console.error('useSupportedVsCurrencies:', err));
  }, []);
  return currencies;
}
