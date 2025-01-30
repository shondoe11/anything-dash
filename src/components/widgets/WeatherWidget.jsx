import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData } from "../../services/service";


export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState();
    const [currentWeather, setCurrentWeather] = useState();
    const [countrySearch, setCountrySearch] = useState();

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
                                <p>{currentWeather.temp}</p>
                                <p>{currentWeather.condition}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            
        </div>
    )
}