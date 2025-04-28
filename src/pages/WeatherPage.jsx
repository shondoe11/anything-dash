//* weather page: Global & SG overview
import { useState } from 'react';
import { Container, Form, Button, Tabs, Tab, Card, Spinner, Row, Col, Badge, Table, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faThermometerHalf, faTint, faWind } from '@fortawesome/free-solid-svg-icons';
import useGlobalWeather from '../hooks/useGlobalWeather';
import useSGWeather from '../hooks/useSGWeather';

export default function WeatherPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [cityInput, setCityInput] = useState('');
  const [query, setQuery] = useState('');
  const { current, loading: loadingG, error: errorG } = useGlobalWeather(query);
  const { fourDay, twoHour, rainfall, uvIndex, hourly, loading: loadingSG, error: errorSG } = useSGWeather();

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(cityInput.trim());
  };

  const regionColors = { west: 'primary', east: 'success', central: 'warning', south: 'info', north: 'danger' };

  return (
    <Container className="my-4">
      <h1 className="mb-4">Weather Forecast</h1>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="global" title="Global">
          <Form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="Enter city or country"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </Form>
          {loadingG && <Spinner animation="border" />}
          {errorG && <p className="text-danger">Failed to load global weather</p>}
          {current?.location && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <img src={current.current.condition.icon} alt={current.current.condition.text} />
                  <div className="ms-3">
                    <Card.Title>{current.location.name}, {current.location.country}</Card.Title>
                    <div className="text-muted">{current.current.condition.text}</div>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-3 mb-2">
                  <div>Temp: {current.current.temp_c}°C</div>
                  <div>Feels like: {current.current.feelslike_c}°C</div>
                  <div>Humidity: {current.current.humidity}%</div>
                  <div>Wind: {current.current.wind_kph} kph</div>
                  <div>Precip: {current.current.precip_mm} mm</div>
                </div>
                <Link to={`/weather/${encodeURIComponent(current.location.country)}`}>View Details →</Link>
              </Card.Body>
            </Card>
          )}
          {!loadingG && !errorG && query && !current?.location && (
            <p className="text-muted">no results found for {query}.</p>
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
                      return <Badge bg={variant} className="me-2">{latest.value} {label}</Badge>;
                    })()}
                    <div className="small text-muted mt-2">
                      As of: {new Date(uvIndex.items[0].index[0].timestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
                    </div>
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
                      <span><FontAwesomeIcon icon={faClock} className="me-2" />2-Hour Forecast</span>
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
                    <span><FontAwesomeIcon icon={faClock} className="me-2" />24-Hour Forecast</span>
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
                                <div>{p.timePeriod?.text || `${start}–${end}`}</div>
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
                    <span><FontAwesomeIcon icon={faCalendarAlt} className="me-2" />4-Day Forecast</span>
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
                            <div className="small mb-1"><FontAwesomeIcon icon={faThermometerHalf} className="me-1" />{f.temperature.low}°C–{f.temperature.high}°C</div>
                            <div className="small mb-1"><FontAwesomeIcon icon={faTint} className="me-1 text-primary" />{f.relativeHumidity.low}%–{f.relativeHumidity.high}%</div>
                            <div className="small"><FontAwesomeIcon icon={faWind} className="me-1" />{f.wind.direction} {f.wind.speed.low}–{f.wind.speed.high} kph</div>
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
                    <div className="small text-muted mt-2">As of: {new Date(rainfall.items[0].timestamp).toLocaleString('en-GB',{ day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}</div>
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