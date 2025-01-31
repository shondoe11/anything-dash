import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData, fetchFourDayWeatherDataSG } from "../../services/service";
import styles from './WeatherWidget.module.css'

export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [countrySearch, setCountrySearch] = useState(null);
    const [townSearch, setTownSearch] = useState('');
    const [townWeather, setTownWeather] = useState('');
    const [towns, setTowns] = useState([]);

    useEffect(() => {
        const fetchTowns = async () => {
            try {
                const neaData = await fetchNEAWeatherData();
                const townList = neaData.items[0].forecasts.map((forecast) => forecast.area);
                setTowns(townList);
            } catch (error) {
                console.error('fetch list of towns FAILED: ', error);
            }
        };
        fetchTowns();
    }, []);

    const processForecastData = (data) => {
        if (!data || !data.data || !data.data.records || data.data.records.length === 0) {
            console.error('Forecast format WRONG: ', data);
            return;
        }
        const forecasts = data.data.records[0].forecasts;
        setForecastData(forecasts);
    };

    // fetch initial NEA forecast data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const neaFourDayData = await fetchFourDayWeatherDataSG();
                processForecastData(neaFourDayData);
            } catch (error) {
                console.error('initial SG 4D weather data load FAIL: ', error);
            }
        };
        loadInitialData();
    }, []);

    const handleCountrySearch = async (e) => {
        e.preventDefault();
        if (!countrySearch) return;
        try {
            const weather = await fetchWeatherData(countrySearch);
            setCurrentWeather({
                temp: weather.current.temp_c,
                condition: weather.current.condition.text,
                icon: weather.current.condition.icon,
                location: weather.location.name
            });
        } catch (error) {
            console.error('fetch weather FAIL : ', error);
        }
    };

    useEffect(() => {
        if (!townSearch) return;
        const fetchTownWeather = async () => {
            try {
                const neaData = await fetchNEAWeatherData();
                const townForecast = neaData.items[0].forecasts.find(
                    f => f.area.toLowerCase() === townSearch.toLowerCase()
                );
                setTownWeather(townForecast || null);
            } catch (error) {
                console.error('fetch town weather FAIL: ', error);
            }
        };
        fetchTownWeather();
    }, [townSearch]);

    return (
        <div className={styles.weatherWidget}>
            <div className={styles.topRow}>
                
                <div className={`${styles.section} ${styles.currentWeather}`}>
                    <h3>Current Weather by Country</h3>
                    <form onSubmit={handleCountrySearch} className={styles.searchForm}>
                        <div className={styles.inputGroup}>
                            <label>Search Location:</label>
                            <input 
                            type="text" 
                            value={countrySearch} 
                            onChange={(e) => setCountrySearch(e.target.value)} 
                            placeholder="Enter country/city" />
                        </div>
                        <button type="submit" className={styles.searchButton}><span>Search</span></button>
                    </form>
                    {currentWeather && (
                        <div className={styles.weatherCard}>
                            <h4>{currentWeather.location}:</h4>
                            <div className={styles.weatherInfo}>
                                <img src={currentWeather.icon} alt="weather-condition.jpg" />
                                <div>
                                    <p>{currentWeather.temp}°C</p>
                                    <p>{currentWeather.condition}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`${styles.section} ${styles.forecastSection}`}>
                    <h3>4-Day Singapore Forecast</h3>
                    <div className={styles.forecastGrid}>
                        {forecastData?.map((day, index) => (
                            <div key={index} className={styles.forecastItem}>
                                <h4>{day.day} ({day.timestamp.split("T")[0]})</h4>
                                <p className={styles.smallText}>🔮 {day.forecast.text} ({day.forecast.summary})</p>
                                <p className={styles.smallText}>🌡️ {day.temperature.low}°C - {day.temperature.high}°C</p>
                                <p className={styles.smallText}>💧 {day.relativeHumidity.low}% - {day.relativeHumidity.high}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${styles.section} ${styles.townWeather}`}>
                    <h3>Singapore Town Weather</h3>
                    <form className={styles.searchForm}>
                        <div className={styles.inputGroup}>
                            <label>Search Town:</label>
                            <select 
                            value={townSearch} 
                            onChange={(e) => setTownSearch(e.target.value)}>
                                <option value=''>Select a town</option>
                                {towns.map((town, index) => (
                                    <option key={index} value={town}>{town}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                    {townWeather && (
                        <div className={styles.weatherCard}>
                            <h4>{townWeather.area}:</h4>
                            <p>{townWeather.forecast}</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}