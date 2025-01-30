import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData, fetchFourDayWeatherDataSG } from "../../services/service";


export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [countrySearch, setCountrySearch] = useState(null);
    const [townSearch, setTownSearch] = useState('');
    const [townWeather, setTownWeather] = useState('');

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

    const handleTownSearch = async (e) => {
        e.preventDefault();
        if (!townSearch) return;
        try {
            const neaData = await fetchNEAWeatherData();
            const townForecast = neaData.items[0].forecasts.find(
                f => f.area.toLowerCase() === townSearch.toLowerCase()
            );
            setTownWeather(townForecast);
        } catch (error) {
            console.error('fetch town weather FAIL: ', error);
        }
    };

    return (
        <div>
            <div>
                <h3>Current Weather by Country</h3>
                <form onSubmit={handleCountrySearch}>
                    <div>
                        <label>Search Location:</label>
                        <input 
                        type="text" 
                        value={countrySearch} 
                        onChange={(e) => setCountrySearch(e.target.value)} 
                        placeholder="Enter country/city" />
                    </div>
                    <button type="submit">Search</button>
                </form>
                {currentWeather && (
                    <div>
                        <h4>{currentWeather.location}</h4>
                        <div>
                            <img src={currentWeather.icon} alt="weather-condition.jpg" />
                            <div>
                                <p>{currentWeather.temp}°C</p>
                                <p>{currentWeather.condition}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                <h3>4-Day Singapore Forecast</h3>
                <div>
                    {forecastData?.map((day, index) => (
                        <div key={index}>
                            <h4>{day.day} ({day.timestamp.split("T")[0]})</h4>
                            <p>Forecast: {day.forecast.text} ({day.forecast.summary})</p>
                            <p>Temperature: {day.temperature.low}°C - {day.temperature.high}°C</p>
                            <p>Humidity: {day.relativeHumidity.low}% - {day.relativeHumidity.high}%</p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3>Singapore Town Weather</h3>
                <form onSubmit={handleTownSearch}>
                    <div>
                        <label>Search Town:</label>
                        <input 
                        type="text" 
                        value={townSearch} 
                        onChange={(e) => setTownSearch(e.target.value)} 
                        placeholder="Enter Singapore town" />
                    </div>
                    <button type="submit">Search</button>
                </form>
                {townWeather && (
                    <div>
                        <h4>{townWeather.area}</h4>
                        <p>Forecast: {townWeather.forecast}</p>
                    </div>
                )}
            </div>
        </div>
    );
}