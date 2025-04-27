import { Container, Spinner, Card, Button, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import useGlobalWeather from '../hooks/useGlobalWeather';

export default function WeatherDetail() {
  const { country } = useParams();
  const [unit, setUnit] = useState('C');
  const { current, forecast, weatherAlerts, loading, error } = useGlobalWeather(country, { days: 14, aqi: true, alerts: true });
  //~ guard: only toggle if data loaded
  const toggleUnit = () => { if(current) setUnit(u => (u === 'C' ? 'F' : 'C')); };

  return (
    <Container className="my-4">
      <h1 className="mb-4">Weather Details: {current?.location?.name || country}</h1>
      <Button variant="secondary" size="sm" onClick={toggleUnit} className="mb-3">
        unit: °{unit}
      </Button>
      {loading && <Spinner animation="border" />}
      {!loading && !error && !current?.current && (
        <p className="text-muted">no weather data for {country}.</p>
      )}
      {error && <p className="text-danger">Failed to load weather details</p>}
      {current?.current && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Current Weather</Card.Title>
            <div className="d-flex align-items-center gap-2">
              <img src={current.current.condition.icon} alt={current.current.condition.text} />
              <span>{current.current.condition.text}</span>
            </div>
            <div>Temp: {unit === 'C' ? `${current.current.temp_c}°C` : `${current.current.temp_f}°F`}</div>
            <div>Feels like: {unit === 'C' ? `${current.current.feelslike_c}°C` : `${current.current.feelslike_f}°F`}</div>
            <div>Humidity: {current.current.humidity}%</div>
            <div>Wind: {unit === 'C' ? `${current.current.wind_kph} kph` : `${current.current.wind_mph} mph`}</div>
            <div>Gust: {unit === 'C' ? `${current.current.gust_kph} kph` : `${current.current.gust_mph} mph`}</div>
            <div>Pressure: {unit === 'C' ? `${current.current.pressure_mb} mb` : `${current.current.pressure_in} in`}</div>
            <div>Visibility: {unit === 'C' ? `${current.current.vis_km} km` : `${current.current.vis_miles} miles`}</div>
            <div>Cloud cover: {current.current.cloud}%</div>
            <div>UV index: {current.current.uv}</div>
          </Card.Body>
        </Card>
      )}
      {current?.location && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Location Info</Card.Title>
            <div>Region: {current.location.region}</div>
            <div>Localtime: {current.location.localtime}</div>
            <div>Timezone: {current.location.tz_id}</div>
            <div>Coordinates: {current.location.lat}, {current.location.lon}</div>
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
          <Card.Body>
            <Card.Title>14-Day Forecast</Card.Title>
            <div className="d-flex flex-wrap gap-3">
              {forecast.forecast.forecastday.map(day => (
                <Card key={day.date} className="p-2" style={{ width: '10rem' }}>
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
            <Card.Title>Hourly Forecast (Today)</Card.Title>
            <div className="d-flex flex-wrap gap-2">
              {forecast.forecast.forecastday[0].hour.map((h, idx) => (
                <div key={idx} className="text-center" style={{ width: '6rem' }}>
                  <div>{h.time.split(' ')[1]}</div>
                  <img src={h.condition.icon} alt={h.condition.text} />
                  <div>{unit === 'C' ? `${h.temp_c}°C` : `${h.temp_f}°F`}</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
      {weatherAlerts?.alerts?.alert?.length > 0 && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Weather Alerts</Card.Title>
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
      <Link to="/weather">Back to overview</Link>
    </Container>
  );
}
