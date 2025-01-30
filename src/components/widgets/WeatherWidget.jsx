import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData } from "../../services/service";


export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState();
    const [currentWeather, setCurrentWeather] = useState();
    const [countrySearch, setCountrySearch] = useState();
    const [townSearch, setTownSearch] = useState();
    const [townWeather, setTownWeather] = useState();

    // fetch initial NEA forecast data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const neaData = await fetchNEAWeatherData();
                processForecastData(neaData);
            } catch (error) {
                console.error('initial weather data load FAIL: ', error);
            }
        };
        loadInitialData();
    }, []);

    const processForecastData = (data) => {
        const forecasts = data.items[0].forecasts;
        setForecastData(forecasts);
    };

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
                                <p>{currentWeather.temp} °C</p>
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
                            <h4>{day.date}</h4>
                            <p>Region: {day.area}</p>
                            <p>Forecase: {day.forecast}</p>
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
                        <p>Temperature: {townWeather.temperature} °C</p>
                        <p>Forecast: {townWeather.forecast}</p>
                    </div>
                )}
            </div>
        </div>
    );
}