//* custom hook fr global weather data
import { useState, useEffect } from 'react';
import { fetchWeatherData, fetchForecastWeatherData, fetchHistoricalWeatherData, fetchWeatherAlerts } from '../services/service';

export default function useGlobalWeather(city, options = {}) {
  const { days = 7, aqi = false, alerts = false, historyDate = null } = options;
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    fetchWeatherData(city)
      .then(res => setCurrent(res))
      .catch(err => setError(err));
    fetchForecastWeatherData(city, days, aqi, alerts)
      .then(res => setForecast(res))
      .catch(err => setError(err));
    if (historyDate) {
      fetchHistoricalWeatherData(city, historyDate)
        .then(res => setHistory(res))
        .catch(err => setError(err));
    }
    if (alerts) {
      fetchWeatherAlerts(city)
        .then(res => setWeatherAlerts(res))
        .catch(err => setError(err));
    }
    setLoading(false);
  }, [city, days, aqi, alerts, historyDate]);

  return { current, forecast, history, weatherAlerts, loading, error };
}
