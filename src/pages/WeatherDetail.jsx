import { Container, Spinner, Card, Button, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import useGlobalWeather from '../hooks/useGlobalWeather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThermometerHalf, faTemperatureHigh, faTint, faWind, faTachometerAlt, faEye, faCloud, faSun, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function WeatherDetail() {
  const { country } = useParams();
  const [unit, setUnit] = useState('C');
  const { current, forecast, weatherAlerts, history, loading, error } = useGlobalWeather(country, { days: 14, aqi: true, alerts: true, historyDays: 7 });

  //~ guard: only toggle if data loaded
  const toggleUnit = () => { if(current) setUnit(u => (u === 'C' ? 'F' : 'C')); };

  const detailStart = forecast?.forecast?.forecastday?.[0]?.date;
  const detailEnd = forecast?.forecast?.forecastday?.slice(-1)[0]?.date;

  return (
    <Container className="my-4">
      <h1 className="mb-4">Weather Details: {current?.location?.name || country}</h1>
      <Button variant="secondary" size="sm" onClick={toggleUnit} className="mb-3">
        Unit: °{unit}
      </Button>
      {loading && <Spinner animation="border" />}
      {!loading && !error && !current?.current && (
        <p className="text-muted">no weather data for {country}.</p>
      )}
      {error && <p className="text-danger">Failed to load weather details</p>}
      {current?.current && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Current Weather</span>
            <span className="small text-muted">{current.location.localtime} ({current.location.tz_id.replace(/_/g, ' ')})</span>
          </Card.Header>
          <Card.Body>
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src={current.current.condition.icon} alt={current.current.condition.text} />
              <span>{current.current.condition.text}</span>
            </div>
            <div className="d-flex flex-wrap justify-content-evenly gap-3">
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faThermometerHalf} className="me-1"/>Temp: {unit === 'C' ? `${current.current.temp_c}°C` : `${current.current.temp_f}°F`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faTemperatureHigh} className="me-1"/>Feels like: {unit === 'C' ? `${current.current.feelslike_c}°C` : `${current.current.feelslike_f}°F`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faTint} className="me-1"/>Humidity: {current.current.humidity}%</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faWind} className="me-1"/>Wind: {unit === 'C' ? `${current.current.wind_kph} kph` : `${current.current.wind_mph} mph`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faWind} className="me-1"/>Gust: {unit === 'C' ? `${current.current.gust_kph} kph` : `${current.current.gust_mph} mph`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faTachometerAlt} className="me-1"/>Pressure: {unit === 'C' ? `${current.current.pressure_mb} mb` : `${current.current.pressure_in} in`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faEye} className="me-1"/>Visibility: {unit === 'C' ? `${current.current.vis_km} km` : `${current.current.vis_miles} miles`}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faCloud} className="me-1"/>Cloud: {current.current.cloud}%</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faSun} className="me-1"/>UV: {current.current.uv}</div>
              <div className="flex-fill text-center d-flex align-items-center justify-content-center gap-1" style={{ minWidth: '8rem' }}><FontAwesomeIcon icon={faMapMarkerAlt} className="me-1"/>Coords: {current.location.lat}, {current.location.lon}</div>
            </div>
          </Card.Body>
        </Card>
      )}
      {current?.current?.air_quality && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Air Quality</Card.Title>
            <Table size="sm">
              <tbody>
                {Object.entries(current.current.air_quality).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key.replace('_', '.')}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      {forecast?.forecast?.forecastday && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>{forecast.forecast.forecastday.length}-Day Forecast</span>
            <span className="small text-muted">{new Date(detailStart).toLocaleDateString('en-GB',{weekday:'short'})} - {new Date(detailEnd).toLocaleDateString('en-GB',{weekday:'short'})}</span>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-evenly flex-wrap gap-3">
              {forecast.forecast.forecastday.map(day => (
                <Card key={day.date} className="text-center flex-fill p-2" style={{ minWidth: '10rem' }}>
                  <Card.Body>
                    <Card.Subtitle className="mb-2">{day.date}</Card.Subtitle>
                    <img src={day.day.condition.icon} alt={day.day.condition.text} />
                    <div>{day.day.condition.text}</div>
                    <div>H: {day.day.maxtemp_c}°C L: {day.day.mintemp_c}°C</div>
                    <div>Chance Rain: {day.day.daily_chance_of_rain}% Snow: {day.day.daily_chance_of_snow}%</div>
                    <div>Avg Humidity: {day.day.avghumidity}%</div>
                    <div>UV: {day.day.uv}</div>
                    <div>Sunrise: {day.astro.sunrise} Sunset: {day.astro.sunset}</div>
                    <div>Moon phase: {day.astro.moon_phase} ({day.astro.moon_illumination}% illum)</div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
      {/* Hourly Forecast (Today) */}
      {forecast?.forecast?.forecastday?.[0]?.hour && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title className="mb-4">Hourly Forecast (Today)</Card.Title>
            <div className="d-flex flex-wrap gap-2">
              {forecast.forecast.forecastday[0].hour.map((h, idx) => (
                <Card key={idx} className="text-center mb-2" style={{ width: '6rem' }}>
                  <Card.Body className="p-2">
                    <div className="small mb-1">{h.time.split(' ')[1]}</div>
                    <img src={h.condition.icon} alt={h.condition.text} />
                    <div>{unit === 'C' ? `${h.temp_c}°C` : `${h.temp_f}°F`}</div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
      {/* Historical Weather */}
      {history?.length > 0 && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Historical Weather</span>
            <span className="small text-muted">Last 7 Days</span>
          </Card.Header>
          <Card.Body>
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Condition</th>
                  <th className="align-middle">Max/Min °{unit}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const entry = h.forecast?.forecastday?.[0];
                  if (!entry) return null;
                  const { date, day: dayData } = entry;
                  return (
                    <tr key={i}>
                      <td className="align-middle">{date}, {new Date(date).toLocaleDateString('en-GB',{weekday:'short'})}</td>
                      <td className="d-flex align-items-center align-middle"><img src={dayData.condition.icon} alt={dayData.condition.text} className="me-2" />{dayData.condition.text}</td>
                      <td className="align-middle">{unit === 'C' ? `${dayData.maxtemp_c.toFixed(1)} / ${dayData.mintemp_c.toFixed(1)}` : `${(dayData.maxtemp_c*9/5+32).toFixed(1)} / ${(dayData.mintemp_c*9/5+32).toFixed(1)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      {weatherAlerts?.alerts?.alert?.length > 0 && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Weather Alerts</span>
            <span className="small text-muted">{weatherAlerts.alerts.alert.length}</span>
          </Card.Header>
          <Card.Body>
            {weatherAlerts.alerts.alert.map((a, i) => (
              <div key={i} className="mb-2">
                <h6>{a.event}</h6>
                <small>{a.effective} to {a.expires}</small>
                <p>{a.desc}</p>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
      <Button variant="secondary" size="sm" as={Link} to="/weather" state={{ clearSearch: true }} className="mt-3">
        Back to overview
      </Button>
    </Container>
  );
}
