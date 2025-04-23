import { useState, useEffect } from 'react';
import { fetchWeatherData, fetchNEAWeatherData, fetchFourDayWeatherDataSG } from "../../services/service";
import { toast } from 'react-toastify';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { fetchWeatherPreferences, saveWeatherPreferences } from '../../services/service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThermometerHalf, faTint } from '@fortawesome/free-solid-svg-icons';
import { FaCloudSunRain } from 'react-icons/fa';

export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [countrySearch, setCountrySearch] = useState('');
    const [townSearch, setTownSearch] = useState('');
    const [townWeather, setTownWeather] = useState('');
    const [towns, setTowns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    //~ track Airtable record ID fr pref upsert
    const { userRecordId, login } = useAuth();
    const [prefCountry, setPrefCountry] = useState('');
    const [prefTown, setPrefTown] = useState('');

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

    //& fetch initial NEA forecast data
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
        if (!countrySearch || countrySearch.trim() === '') {
            toast.error('Enter a valid location');
            return;
        }
        setIsLoading(true);
        try {
            const weather = await fetchWeatherData(countrySearch);
            setCurrentWeather({
                temp: weather.current.temp_c,
                condition: weather.current.condition.text,
                icon: weather.current.condition.icon,
                country: weather.location.country,
                city: weather.location.name
            });
            //~ setCountrySearch('');
            toast.success('Weather data fetch success')
        } catch (error) {
            console.error('fetch weather FAIL : ', error);
            toast.error('Failed to fetch weather data. Please try again.');
        } finally {
            setIsLoading(false);
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

    const handleSaveWeatherPref = async () => {
        if (!userRecordId) {
            login();
            return;
        }
        //& guard fr no current weather
        if (!currentWeather) {
            toast.error('Please fetch weather data before saving preferences.');
            return;
        }
        if (countrySearch === prefCountry) {
            toast.error('No changes to save.');
            return;
        }
        try {
            //~ update country field on Users record
            await saveWeatherPreferences(userRecordId, { Country: countrySearch });
            toast.success('Preferences saved!');
            setPrefCountry(countrySearch);
        } catch (error) {
            toast.error('Failed to save preferences. Please try again.');
            console.error(error);
        }
    };

    //& save SG town preference
    const handleSaveTownPref = async () => {
        if (!userRecordId) {
            login();
            return;
        }
        if (!townSearch) {
            toast.error('Please select a town before saving preferences.');
            return;
        }
        if (townSearch === prefTown) {
            toast.error('No changes to save.');
            return;
        }
        try {
            //~ update town field on Users record
            await saveWeatherPreferences(userRecordId, { Town: townSearch });
            toast.success('Town preference saved!');
            setPrefTown(townSearch);
        } catch (error) {
            toast.error('Failed to save town preference. Please try again.');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!userRecordId) return;
        const loadPrefs = async () => {
            try {
                const { fields } = await fetchWeatherPreferences(userRecordId);
                if (fields.Country) {
                    setCountrySearch(fields.Country);
                    setPrefCountry(fields.Country);
                    //~ load saved country weather
                    const weather = await fetchWeatherData(fields.Country);
                    setCurrentWeather({
                        temp: weather.current.temp_c,
                        condition: weather.current.condition.text,
                        icon: weather.current.condition.icon,
                        country: weather.location.country,
                        city: weather.location.name
                    });
                }
                if (fields.Town) {
                    setTownSearch(fields.Town);
                    setPrefTown(fields.Town);
                }
            } catch (error) {
                console.error('load weather prefs failed:', error);
            }
        };
        loadPrefs();
    }, [userRecordId]);

    //& capitalize first letter of input
    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <Card className="border-0 shadow-sm mb-4 widget-card h-100 overflow-auto">
            <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4 gradient-header">
                <div className="d-flex align-items-center">
                    <FaCloudSunRain className="text-white me-2 widget-icon" size={24} />
                    <h5 className="mb-0 text-white fw-bold">Weather</h5>
                </div>
            </Card.Header>
            <Card.Body className="p-4 weather-widget-container">
                <Row className="g-3">
                    <Col xs={12} md={4} lg={3}>
                        {/* Current Weather by Country */}
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="h-100 d-flex flex-column justify-content-between">
                                <h5 className="fs-6 fw-bold mb-3">Current Weather by Country</h5>
                                <Form onSubmit={handleCountrySearch} className="mb-2">
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">Search Location:</Form.Label>
                                        <Row className="g-2">
                                            <Col>
                                                <Form.Control
                                                    size="sm"
                                                    type="text"
                                                    value={countrySearch}
                                                    onChange={(e) => {
                                                        //~ allow letters & spaces only
                                                        let val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                        //~ auto-capitalize first letter if all lowercase
                                                        if (/^[a-z\s]+$/.test(val)) {
                                                            val = capitalizeFirstLetter(val);
                                                        }
                                                        setCountrySearch(val);
                                                    }}
                                                    placeholder="Enter country/city"
                                                />
                                            </Col>
                                            <Col xs="auto">
                                                <Button type="submit" variant="success" size="sm">
                                                    Search
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                </Form>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="d-block mx-auto"
                                    onClick={handleSaveWeatherPref}
                                    disabled={isLoading || countrySearch === prefCountry}
                                >
                                    Save Preference
                                </Button>
                                {isLoading ? (
                                    <div className="d-flex justify-content-center my-2">
                                        <Spinner animation="border" size="sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                ) : (
                                    currentWeather && (
                                        <Card className="weather-card mt-2 custom-dark-card w-100">
                                            <Card.Body className="p-2 d-flex flex-column align-items-center justify-content-center text-center">
                                                <h6 className="mb-2">
                                                    {currentWeather.country}, {currentWeather.city}:
                                                </h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <img
                                                        src={currentWeather.icon}
                                                        alt="weather-condition"
                                                        className="img-fluid img-40"
                                                    />
                                                    <div>
                                                        <p className="mb-0">{currentWeather.temp}°C</p>
                                                        <p className="mb-0 small">{currentWeather.condition}</p>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={8} lg={6}>
                        {/* 4-Day Singapore Forecast */}
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <h5 className="fs-6 fw-bold mb-3">4-Day Singapore Forecast</h5>
                                <div className="weather-forecast-grid">
                                    {forecastData?.map((day, index) => (
                                        <Card key={index} className="h-100 weather-card border-0 text-center">
                                            <Card.Body className="p-2">
                                                <h6 className="small fw-bold">
                                                    {day.day} ({new Date(day.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})
                                                </h6>
                                                <p className="small mb-1">
                                                    {day.forecast.text} ({day.forecast.summary})
                                                </p>
                                                <p className="small mb-1 d-flex align-items-center justify-content-center">
                                                    <FontAwesomeIcon icon={faThermometerHalf} className="me-1" />
                                                    {day.temperature.low}°C - {day.temperature.high}°C
                                                </p>
                                                <p className="small mb-1 d-flex align-items-center justify-content-center">
                                                    <FontAwesomeIcon icon={faTint} className="me-1 text-primary" />
                                                    {day.relativeHumidity.low}% - {day.relativeHumidity.high}%
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={12} lg={3}>
                        {/* Singapore Town Weather */}
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="h-100 d-flex flex-column justify-content-between">
                                <h5 className="fs-6 fw-bold mb-3">Singapore Town Weather</h5>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small">Search Town:</Form.Label>
                                        <Form.Select 
                                        size="sm"
                                        value={townSearch} 
                                        onChange={(e) => setTownSearch(e.target.value)}>
                                            <option value=''>Select a town</option>
                                            {towns.map((town, index) => (
                                                <option key={index} value={town}>{town}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Form>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="d-block mx-auto"
                                    onClick={handleSaveTownPref}
                                    disabled={isLoading || townSearch === prefTown}
                                >
                                    Save Preference
                                </Button>
                                {townWeather && (
                                    <Card className="weather-card mt-2 custom-dark-card w-100">
                                        <Card.Body className="p-2 d-flex flex-column align-items-center justify-content-center text-center">
                                            <h6 className="mb-2">{townWeather.area}:</h6>
                                            <p className="small mb-0">{townWeather.forecast}</p>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}