import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData, fetchFourDayWeatherDataSG } from "../../services/service";
import { toast } from 'react-toastify';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';

export default function WeatherWidget() {
    const [forecastData, setForecastData] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [countrySearch, setCountrySearch] = useState('');
    const [townSearch, setTownSearch] = useState('');
    const [townWeather, setTownWeather] = useState('');
    const [towns, setTowns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <Card className="p-3 mb-4 weather-container">
            <Row className="g-3">

                <Col md={4} lg={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h5 className="fs-6 fw-bold mb-3">Current Weather by Country</h5>
                            <Form onSubmit={handleCountrySearch} className="d-flex flex-column gap-2 mb-2">
                                <Form.Group>
                                    <Form.Label className="small">Search Location:</Form.Label>
                                    <Form.Control 
                                    size="sm"
                                    type="text" 
                                    value={countrySearch} 
                                    onChange={(e) => setCountrySearch(e.target.value)} 
                                    placeholder="Enter country/city" />
                                </Form.Group>
                                <Button type="submit" variant="success" size="sm" className="align-self-end">Search</Button>
                            </Form>
                            {isLoading ? (
                                <div className="d-flex justify-content-center my-2">
                                    <Spinner animation="border" size="sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (currentWeather && (
                                <Card className="weather-card mt-2 custom-dark-card">
                                    <Card.Body className="p-2">
                                        <h6 className="mb-2">{currentWeather.country}, {currentWeather.city}:</h6>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src={currentWeather.icon} alt="weather-condition" className="img-fluid" style={{width: '40px'}} />
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

                <Col md={8} lg={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h5 className="fs-6 fw-bold mb-3">4-Day Singapore Forecast</h5>
                            <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-4 g-2">
                                {forecastData?.map((day, index) => (
                                    <Col key={index}>
                                        <Card className="h-100 weather-card border-0 text-center">
                                            <Card.Body className="p-2">
                                                <h6 className="small fw-bold">{day.day} ({new Date(day.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})</h6>
                                                <p className="small mb-1">🔮 {day.forecast.text} ({day.forecast.summary})</p>
                                                <p className="small mb-1">🌡️ {day.temperature.low}°C - {day.temperature.high}°C</p>
                                                <p className="small mb-1">💧 {day.relativeHumidity.low}% - {day.relativeHumidity.high}%</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={3}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
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
                            {townWeather && (
                                <Card className="weather-card mt-2 custom-dark-card">
                                    <Card.Body className="p-2">
                                        <h6 className="mb-2">{townWeather.area}:</h6>
                                        <p className="small mb-0">{townWeather.forecast}</p>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
}