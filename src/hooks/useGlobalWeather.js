//* custom hook fr global weather data
import { useState, useEffect } from 'react';
import {
  fetchWeatherData,
  fetchForecastWeatherData,
  fetchHistoricalWeatherData,
  fetchWeatherAlerts,
  fetchAstronomyData,
  fetchMarineData,
  fetchAirQualityData,
  fetchSportsData
} from '../services/service';

export default function useGlobalWeather(city, options = {}) {
  const { 
    days = 7, 
    aqi = false, 
    alerts = false, 
    historyDays = 0, 
    astronomy = false, 
    marine = false, 
    airQuality = false, 
    sport = null 
  } = options;
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState(null);
  const [astronomyData, setAstronomyData] = useState(null);
  const [marineData, setMarineData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [sportsData, setSportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //& user query debouncing limit API calls
  const [debouncedCity, setDebouncedCity] = useState(city);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCity(city), 500);
    return () => clearTimeout(handler);
  }, [city]);

  useEffect(() => {
    let cancelled = false;
    //~ only fetch when city provided
    if (!debouncedCity) {
      setLoading(false);
      setError(null);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        //~ current & forecast in parallel
        const [curRes, fRes] = await Promise.all([
          fetchWeatherData(debouncedCity),
          fetchForecastWeatherData(debouncedCity, days, aqi, alerts)
        ]);
        if (!cancelled) {
          setCurrent(curRes);
          setForecast(fRes);
        }
        //~ historical data
        if (historyDays > 0) {
          const count = Math.min(historyDays, 7);
          const dates = Array.from({ length: count }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (i + 1));
            return d.toISOString().split('T')[0];
          });
          const hist = await Promise.all(dates.map(dt => fetchHistoricalWeatherData(debouncedCity, dt)));
          if (!cancelled) setHistory(hist.filter(r => r?.forecast?.forecastday?.length));
        }
        //~ alerts
        if (alerts) {
          const al = await fetchWeatherAlerts(debouncedCity);
          if (!cancelled) setWeatherAlerts(al);
        }
        //~ astronomy
        if (astronomy) {
          const ad = await fetchAstronomyData(debouncedCity);
          if (!cancelled) setAstronomyData(ad);
        }
        //~ marine
        if (marine && curRes?.location) {
          const md = await fetchMarineData(curRes.location.lat, curRes.location.lon);
          if (!cancelled) setMarineData(md);
        }
        //~ air quality
        if (airQuality) {
          const aq = await fetchAirQualityData(debouncedCity);
          if (!cancelled) setAirQualityData(aq);
        }
        //~ sports
        if (sport) {
          const sd = await fetchSportsData(sport);
          if (!cancelled) setSportsData(sd);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [debouncedCity, days, aqi, alerts, historyDays, astronomy, marine, airQuality, sport]);

  return { 
    current, 
    forecast, 
    history, 
    weatherAlerts, 
    astronomyData, 
    marineData, 
    airQualityData, 
    sportsData, 
    loading, 
    error 
  };
}
