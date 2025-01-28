import React, { useEffect, useState } from 'react';
import { fetchAirtableData, fetchWeatherData, fetchNEAWeatherData, fetchCoinGeckoData, fetchFootballData, fetchAnimeData } from './services/service';

function App() {
  const [airtableData, setAirtableData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [neaWeatherData, setNEAweatherData] = useState(null);
  const [coinData, setCoinData] = useState([]);
  const [footballData, setFootballData] = useState([]);
  const [animeData, setAnimeData] = useState([]);

  useEffect(() => {
    fetchAirtableData().then((data) => setAirtableData(data));
    fetchWeatherData('Singapore').then((data) => setWeatherData(data));
    fetchNEAWeatherData().then((data) => setNEAweatherData(data));
    fetchCoinGeckoData().then((data) => setCoinData(data));
    fetchFootballData().then((data) => setFootballData(data));
    fetchAnimeData().then((data) => setAnimeData(data));
  }, []);

  return (
    <div>
      <h1>APIs</h1>
      <h2>Airtable</h2>
      <pre>{JSON.stringify(airtableData, null, 2)}</pre>
      <h2>Weather</h2>
      <pre>{JSON.stringify(weatherData, null, 2)}</pre>
      <h2>NEA Weather</h2>
      <pre>{JSON.stringify(neaWeatherData, null, 2)}</pre>
      <h2>CoinGecko</h2>
      <pre>{JSON.stringify(coinData, null, 2)}</pre>
      <h2>Football</h2>
      <pre>{JSON.stringify(footballData, null, 2)}</pre>
      <h2>Anime</h2>
      <pre>{JSON.stringify(animeData, null, 2)}</pre>
    </div>
  );
}

export default App;