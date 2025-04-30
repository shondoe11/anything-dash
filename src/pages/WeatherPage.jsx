//* weather page: Global & SG overview
import { useState, useEffect } from 'react';
import { Container, Form, Tabs, Tab, Card, Spinner, Row, Col, Badge, Table, ProgressBar, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faThermometerHalf, faTint, faWind, faArrowUp, faArrowDown, faCloudRain, faSun, faMoon, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
import useGlobalWeather from '../hooks/useGlobalWeather';
import useSGWeather from '../hooks/useSGWeather';
import { fetchSearchAutocomplete } from '../services/service';

export default function WeatherPage() {
  const manual = sessionStorage.getItem('weatherManualQuery') || '';
  const [searchTerm, setSearchTerm] = useState(manual);
  const [city, setCity] = useState(manual);
  const [activeTab, setActiveTab] = useState('global');
  const [suggestions, setSuggestions] = useState([]);
  const historyDays = 0;
  const { current, forecast, weatherAlerts, astronomyData, marineData, loading: loadingG, error: errorG } = useGlobalWeather(city, { days: 14, aqi: true, alerts: true, historyDays, astronomy: true, marine: true });
  const { fourDay, twoHour, rainfall, uvIndex, hourly, loading: loadingSG, error: errorSG } = useSGWeather();

  const regionColors = { west: 'primary', east: 'success', central: 'warning', south: 'info', north: 'danger' };

  const forecastStart = forecast?.forecast?.forecastday?.[0]?.date || '';
  const forecastEnd = forecast?.forecast?.forecastday?.slice(-1)[0]?.date || '';

  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      fetchSearchAutocomplete(searchTerm)
        .then(res => { if (!cancelled) setSuggestions(res || []); })
        .catch(() => { if (!cancelled) setSuggestions([]); });
    }, 500);
    return () => { cancelled = true; clearTimeout(handler); };
  }, [searchTerm]);

  useEffect(() => {
    if (city) sessionStorage.setItem('weatherManualQuery', city);
  }, [city]);

  useEffect(() => {
    if (location.state?.clearSearch) {
      setSearchTerm('');
      setCity('');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Container className="my-4">
      <h1 className="mb-4">Weather Forecast</h1>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="global" title="Global">
          <Form.Control
              list="search-options"
              placeholder="Enter city or country"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onInput={e => {
                const v = e.target.value;
                if (suggestions.some(o => o.name === v)) {
                  setSearchTerm(v);
                  setCity(v);
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setCity(searchTerm);
                }
              }}
              className="mb-3"
          />
          <datalist id="search-options">
            {suggestions.map((opt, i) => (
              <option key={i} value={opt.name} label={`${opt.name}, ${opt.country}`} />
            ))}
          </datalist>
          {loadingG && <Spinner animation="border" />}
          {!loadingG && !current?.location && errorG && <p className="text-danger">Failed to load global weather</p>}
          {current?.location && (
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Today&apos;s Forecast</span>
                <span className="small text-muted">{current.location.localtime} ({current.location.tz_id.replace(/_/g, ' ')})</span>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <img src={current.current.condition.icon} alt={current.current.condition.text} />
                  <div className="ms-3">
                    <Card.Title>{current.location.name}, {current.location.country}</Card.Title>
                    <div className="text-muted">{current.current.condition.text}</div>
                  </div>
                </div>
                <div className="d-flex flex-wrap justify-content-evenly gap-3 mb-2">
                  <div className="text-center"><FontAwesomeIcon icon={faThermometerHalf} className="me-1"/>Temp: {current.current.temp_c.toFixed(1)}°C</div>
                  <div className="text-center"><FontAwesomeIcon icon={faTemperatureHigh} className="me-1"/>Feels like: {current.current.feelslike_c.toFixed(1)}°C</div>
                  <div className="text-center"><FontAwesomeIcon icon={faTint} className="me-1"/>Humidity: {current.current.humidity}%</div>
                  <div className="text-center"><FontAwesomeIcon icon={faWind} className="me-1"/>Wind: {current.current.wind_kph} kph</div>
                  <div className="text-center"><FontAwesomeIcon icon={faCloudRain} className="me-1"/>Precip: {current.current.precip_mm} mm</div>
                </div>
                <Button variant="primary" size="sm" as={Link} to={`/weather/${encodeURIComponent(current.location.country)}`}>
                  View Details →
                </Button>
                {astronomyData?.astronomy?.astro && (
                  <div className="mt-3 d-flex flex-wrap justify-content-evenly gap-3">
                    <div><FontAwesomeIcon icon={faSun} className="me-1"/> Sunrise: {astronomyData.astronomy.astro.sunrise}</div>
                    <div><FontAwesomeIcon icon={faSun} className="me-1"/> Sunset: {astronomyData.astronomy.astro.sunset}</div>
                    <div><FontAwesomeIcon icon={faMoon} className="me-1"/> Moonrise: {astronomyData.astronomy.astro.moonrise}</div>
                    <div><FontAwesomeIcon icon={faMoon} className="me-1"/> Moonset: {astronomyData.astronomy.astro.moonset}</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
          {!loadingG && !errorG && searchTerm && !current?.location && (
            <p className="text-muted">No results found for {searchTerm}.</p>
          )}
          {/* 3-Day Forecast */}
          {forecast?.forecast?.forecastday && (
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>{forecast.forecast.forecastday.length}-Day Forecast</span>
                <span className="small text-muted">{new Date(forecastStart).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} - {new Date(forecastEnd).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-evenly gap-3">
                  {forecast.forecast.forecastday.map((day, i) => (
                    <Card key={i} className="text-center flex-fill" style={{ minWidth: '10rem' }}>
                      <Card.Body className="p-2">
                        <Card.Title className="fs-6 mb-1">{new Date(day.date).toLocaleDateString('en-GB',{weekday:'short'})}</Card.Title>
                        <img src={day.day.condition.icon} alt={day.day.condition.text} />
                        <div className="small mb-1">{day.day.condition.text}</div>
                        <div><FontAwesomeIcon icon={faArrowUp} className="me-1"/>Max: {day.day.maxtemp_c.toFixed(1)}°C</div>
                        <div><FontAwesomeIcon icon={faArrowDown} className="me-1"/>Min: {day.day.mintemp_c.toFixed(1)}°C</div>
                        <div><FontAwesomeIcon icon={faTint} className="me-1"/>Humidity: {day.day.avghumidity}%</div>
                        <div><FontAwesomeIcon icon={faSun} className="me-1"/>UV: {day.day.uv}</div>
                        <div><FontAwesomeIcon icon={faCloudRain} className="me-1"/>Rain chance: {day.day.daily_chance_of_rain}%</div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
          {/* Additional Data */}
          {marineData?.forecast?.tide && (
            <Card className="mb-4">
              <Card.Header>Marine & Tide</Card.Header>
              <Card.Body>
                {marineData.forecast.tide.map((t, idx) => (
                  <div key={idx}>{t.date} {t.time} {t.tide} ({t.type})</div>
                ))}
              </Card.Body>
            </Card>
          )}
          {weatherAlerts?.alerts?.alert?.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Weather Alerts</span>
                <span className="small text-muted">{weatherAlerts.alerts.alert.length}</span>
              </Card.Header>
              <Card.Body>
                {weatherAlerts.alerts.alert.map((a, i) => (
                  <Card key={i} className="mb-2">
                    <Card.Header>{a.headline}</Card.Header>
                    <Card.Body>{a.desc}</Card.Body>
                    <div className="small text-muted">
                      Effective: {a.effective ? new Date(a.effective).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}) : 'Not Set'}
                      {' '}– Expires: {a.expires ? new Date(a.expires).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}) : 'Not Set'}
                    </div>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="sg" title="Singapore">
          {/* UV Index */}
          <Row className="mb-4">
            <Col xs={12}>
              {uvIndex?.items?.[0]?.index && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>UV Index</span>
                    <small className="text-muted">
                      Updated: {new Date(uvIndex.items[0].index[0].timestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    {(() => {
                      const severity = v=>v>=11?['Extreme','dark']:v>=8?['Very High','danger']:v>=6?['High','warning']:v>=3?['Moderate','info']:['Low','success'];
                      const latest = uvIndex.items[0].index[0];
                      const [label,variant] = severity(latest.value);
                      return <Badge bg={variant} className="me-2 fs-3">{latest.value} {label}</Badge>;
                    })()}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
          {/* 2-Hour Forecast */}
          <Row className="mb-4">
            <Col xs={12}>
              {loadingSG ? (
                <Spinner animation="border" />
              ) : errorSG ? (
                <p className="text-danger">Failed to load SG weather</p>
              ) : (
                twoHour?.items?.[0]?.forecasts && (
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span><FontAwesomeIcon icon={faClock} className="me-1"/>2-Hour Forecast</span>
                      <small className="text-muted">
                        Valid: {new Date(twoHour.items[0].valid_period.start).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})} – {new Date(twoHour.items[0].valid_period.end).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap justify-content-evenly gap-2">
                        {twoHour.items[0].forecasts.map((f, i) => (
                          <Card key={i} className="p-2 text-center flex-fill" style={{ minWidth: '8rem' }}>
                            <Card.Body className="p-1">
                              <Card.Title className="fs-6 mb-1">{f.area}</Card.Title>
                              <Card.Text className="small">{f.forecast}</Card.Text>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                )
              )}
            </Col>
          </Row>
          {/* 24-Hour Forecast */}
          <Row className="mb-4">
            <Col xs={12}>
              {hourly?.items?.[0]?.periods && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span><FontAwesomeIcon icon={faClock} className="me-1"/>24-Hour Forecast</span>
                    <small className="text-muted">
                      Updated: {new Date(hourly.items[0].update_timestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    <Table size="sm" bordered responsive className="mb-2">
                      <thead>
                        <tr>
                          <th>Time</th><th>West</th><th>East</th><th>Central</th><th>South</th><th>North</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hourly.items[0].periods.map((p, i) => {
                          const start = new Date(p.time.start).toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric' });
                          const end = new Date(p.time.end).toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric' });
                          return (
                            <tr key={i}>
                              <td>
                                <small className="text-muted">{`${start}–${end}`}</small>
                              </td>
                              <td><Badge bg={regionColors.west}>{p.regions.west}</Badge></td>
                              <td><Badge bg={regionColors.east}>{p.regions.east}</Badge></td>
                              <td><Badge bg={regionColors.central}>{p.regions.central}</Badge></td>
                              <td><Badge bg={regionColors.south}>{p.regions.south}</Badge></td>
                              <td><Badge bg={regionColors.north}>{p.regions.north}</Badge></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
          {/* 4-Day Forecast */}
          <Row className="mb-4">
            <Col xs={12}>
              {fourDay?.data?.records?.[0]?.forecasts && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span><FontAwesomeIcon icon={faCalendarAlt} className="me-1"/>4-Day Forecast</span>
                    <small className="text-muted">
                      Updated: {new Date(fourDay.data.records[0].updatedTimestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex flex-wrap justify-content-evenly gap-3">
                      {fourDay.data.records[0].forecasts.map((f, i) => (
                        <Card key={i} className="text-center flex-fill" style={{ minWidth: '10rem' }}>
                          <Card.Body className="p-2">
                            <Card.Title className="fs-6 mb-1">{f.day}</Card.Title>
                            <Card.Text className="small mb-1">{f.forecast.text} ({f.forecast.summary})</Card.Text>
                            <div className="small mb-1"><FontAwesomeIcon icon={faThermometerHalf} className="me-1"/>{` ${f.temperature.low}°C–${f.temperature.high}°C`}</div>
                            <div className="small mb-1"><FontAwesomeIcon icon={faTint} className="me-1"/> {f.relativeHumidity.low}%–{f.relativeHumidity.high}%</div>
                            <div className="small"><FontAwesomeIcon icon={faWind} className="me-1"/> {f.wind.direction} {f.wind.speed.low}–{f.wind.speed.high} kph</div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
          {/* Rainfall Readings */}
          <Row className="mb-4">
            <Col xs={12}>
              {rainfall?.items?.[0]?.readings && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Rainfall Readings</span>
                    <small className="text-muted">
                      Updated: {new Date(rainfall.items[0].timestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    {(() => {
                      const readings = rainfall.items[0].readings;
                      const stations = rainfall.metadata.stations;
                      const stationMap = Object.fromEntries(stations.map(s=>[s.id,s.name]));
                      const maxVal = Math.max(...readings.map(r=>r.value));
                      return readings.map((r, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="d-flex justify-content-between"><span>{stationMap[r.station_id]||r.station_id}</span><span>{r.value} mm</span></div>
                          <ProgressBar now={r.value} max={maxVal} label={`${r.value} mm`} variant="info"/>
                        </div>
                      ));
                    })()}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
}