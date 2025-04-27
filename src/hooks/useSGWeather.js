//* custom hook fr SG weather data
import { useState, useEffect } from 'react';
import { fetchFourDayWeatherDataSG, fetchNEAWeatherData, fetchHourlyForecastDataSG, fetchRainfallDataSG, fetchUVIndexDataSG } from '../services/service';

export default function useSGWeather() {
  const [fourDay, setFourDay] = useState(null);
  const [twoHour, setTwoHour] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [rainfall, setRainfall] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchFourDayWeatherDataSG(),
      fetchNEAWeatherData(),
      fetchHourlyForecastDataSG().catch(err => {
        console.warn('Hourly forecast fetch failed:', err);
        return null;
      }),
      fetchRainfallDataSG(),
      fetchUVIndexDataSG(),
    ])
      .then(([fourDayData, twoHourData, hourlyData, rainfallData, uvData]) => {
        setFourDay(fourDayData);
        setTwoHour(twoHourData);
        if (hourlyData) setHourly(hourlyData);
        setRainfall(rainfallData);
        setUvIndex(uvData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { fourDay, twoHour, hourly, rainfall, uvIndex, loading, error };
}
