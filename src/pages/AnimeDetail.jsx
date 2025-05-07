//* detail pg fr anime by id
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Spinner, Alert, Badge, Button, Image, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { fetchAnimeById, fetchAnimeCharacters, fetchAnimeReviews, fetchAnimeEpisodes, fetchAnimeStaff, fetchAnimeStats } from '../services/service';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendarAlt, faClock, faUsers, faQuoteLeft, faFilm, faChartBar, faUser } from '@fortawesome/free-solid-svg-icons';

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState({
    anime: true,
    characters: false,
    episodes: false,
    reviews: false,
    staff: false,
    stats: false
  });
  const [error, setError] = useState(null);

  //& anime deets
  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const data = await fetchAnimeById(id);
        if (data.data) {
          setAnime(data.data);
        } else {
          setError('Anime not found');
        }
      } catch (error) {
        console.error('Error fetching anime details:', error);
        setError('Failed to load anime details');
        toast.error('Failed to load anime details');
      } finally {
        setLoading(prev => ({ ...prev, anime: false }));
      }
    };
    
    fetchAnimeDetails();
  }, [id]);

  //& anime chars based on active tab
  useEffect(() => {
    const fetchCharacterData = async () => {
      if (activeTab !== 'characters') return;
      
      setLoading(prev => ({ ...prev, characters: true }));
      try {
        const data = await fetchAnimeCharacters(id);
        setCharacters(data.data || []);
      } catch (error) {
        console.error('Error fetching anime characters:', error);
        toast.error('Failed to load characters');
      } finally {
        setLoading(prev => ({ ...prev, characters: false }));
      }
    };
    
    fetchCharacterData();
  }, [id, activeTab]);

  //& anime eps based on active tab
  useEffect(() => {
    const fetchEpisodeData = async () => {
      if (activeTab !== 'episodes') return;
      
      setLoading(prev => ({ ...prev, episodes: true }));
      try {
        const data = await fetchAnimeEpisodes(id);
        setEpisodes(data.data || []);
      } catch (error) {
        console.error('Error fetching anime episodes:', error);
        toast.error('Failed to load episodes');
      } finally {
        setLoading(prev => ({ ...prev, episodes: false }));
      }
    };
    
    fetchEpisodeData();
  }, [id, activeTab]);

  //& anime reviews based on active tab
  useEffect(() => {
    const fetchReviewData = async () => {
      if (activeTab !== 'reviews') return;
      
      setLoading(prev => ({ ...prev, reviews: true }));
      try {
        const data = await fetchAnimeReviews(id);
        setReviews(data.data || []);
      } catch (error) {
        console.error('Error fetching anime reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(prev => ({ ...prev, reviews: false }));
      }
    };
    
    fetchReviewData();
  }, [id, activeTab]);

  //& anime staff based on active tab
  useEffect(() => {
    const fetchStaffData = async () => {
      if (activeTab !== 'staff') return;
      
      setLoading(prev => ({ ...prev, staff: true }));
      try {
        const data = await fetchAnimeStaff(id);
        setStaff(data.data || []);
      } catch (error) {
        console.error('Error fetching anime staff:', error);
        toast.error('Failed to load staff');
      } finally {
        setLoading(prev => ({ ...prev, staff: false }));
      }
    };
    
    fetchStaffData();
  }, [id, activeTab]);

  //& anime stats based on active tab
  useEffect(() => {
    const fetchStatsData = async () => {
      if (activeTab !== 'stats') return;
      
      setLoading(prev => ({ ...prev, stats: true }));
      try {
        const data = await fetchAnimeStats(id);
        setStats(data.data || null);
      } catch (error) {
        console.error('Error fetching anime stats:', error);
        toast.error('Failed to load stats');
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    
    fetchStatsData();
  }, [id, activeTab]);

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
        <Link to="/anime">
          <Button variant="primary">Back to Anime</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {loading.anime ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : anime ? (
        <>
          {/* Header section */}
          <Row className="mb-4">
            <Col md={4} lg={3}>
              <Image 
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318'} 
                alt={anime.title} 
                fluid 
                className="rounded shadow-sm mb-3"
              />
              <div className="d-grid gap-2">
                {anime.url && (
                  <Button 
                    variant="primary" 
                    href={anime.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on MyAnimeList
                  </Button>
                )}
                <Link to="/anime">
                  <Button variant="outline-secondary" className="w-100">Back to Anime</Button>
                </Link>
              </div>
            </Col>
            <Col md={8} lg={9}>
              <h1>{anime.title}</h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <h4 className="text-muted">{anime.title_english}</h4>
              )}
              <div className="mb-3 d-flex flex-wrap gap-2">
                {anime.genres?.map(genre => (
                  <Badge key={genre.mal_id} bg="secondary" className="me-1">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              <Row className="mb-3">
                <Col sm={6} md={4}>
                  <p><FontAwesomeIcon icon={faStar} className="text-warning me-2" /> <strong>Score:</strong> {anime.score || 'N/A'}</p>
                </Col>
                <Col sm={6} md={4}>
                  <p><FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> <strong>Aired:</strong> {anime.aired?.string || 'N/A'}</p>
                </Col>
                <Col sm={6} md={4}>
                  <p><FontAwesomeIcon icon={faClock} className="me-2" /> <strong>Duration:</strong> {anime.duration || 'N/A'}</p>
                </Col>
                <Col sm={6} md={4}>
                  <p><strong>Type:</strong> {anime.type || 'N/A'}</p>
                </Col>
                <Col sm={6} md={4}>
                  <p><strong>Status:</strong> {anime.status || 'N/A'}</p>
                </Col>
                <Col sm={6} md={4}>
                  <p><strong>Episodes:</strong> {anime.episodes || 'N/A'}</p>
                </Col>
              </Row>
              <Card className="mb-3">
                <Card.Header><strong>Synopsis</strong></Card.Header>
                <Card.Body>
                  <Card.Text>{anime.synopsis || 'No synopsis available.'}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        
          {/* Tab nav fr extra content */}
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="overview">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="characters">
                  <FontAwesomeIcon icon={faUsers} className="me-2" /> Characters
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="episodes">
                  <FontAwesomeIcon icon={faFilm} className="me-2" /> Episodes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews">
                  <FontAwesomeIcon icon={faQuoteLeft} className="me-2" /> Reviews
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="staff">
                  <FontAwesomeIcon icon={faUser} className="me-2" /> Staff
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stats">
                  <FontAwesomeIcon icon={faChartBar} className="me-2" /> Stats
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              {/* Overview tab */}
              <Tab.Pane eventKey="overview">
                <Row>
                  <Col md={6}>
                    <Card className="mb-4 shadow-sm">
                      <Card.Header><strong>Information</strong></Card.Header>
                      <Card.Body>
                        <p><strong>Japanese Title:</strong> {anime.title_japanese || 'N/A'}</p>
                        <p><strong>Source:</strong> {anime.source || 'N/A'}</p>
                        <p><strong>Season:</strong> {anime.season?.charAt(0).toUpperCase() + anime.season?.slice(1) || 'N/A'} {anime.year || ''}</p>
                        <p><strong>Broadcast:</strong> {anime.broadcast?.string || 'N/A'}</p>
                        <p><strong>Licensors:</strong> {anime.licensors?.map(l => l.name).join(', ') || 'N/A'}</p>
                        <p><strong>Studios:</strong> {anime.studios?.map(s => s.name).join(', ') || 'N/A'}</p>
                        <p><strong>Rating:</strong> {anime.rating || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-4 shadow-sm">
                      <Card.Header><strong>Statistics</strong></Card.Header>
                      <Card.Body>
                        <p><strong>Score:</strong> {anime.score} ({anime.scored_by?.toLocaleString() || 'N/A'} users)</p>
                        <p><strong>Rank:</strong> {anime.rank ? `#${anime.rank}` : 'N/A'}</p>
                        <p><strong>Popularity:</strong> {anime.popularity ? `#${anime.popularity}` : 'N/A'}</p>
                        <p><strong>Members:</strong> {anime.members?.toLocaleString() || 'N/A'}</p>
                        <p><strong>Favorites:</strong> {anime.favorites?.toLocaleString() || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                    {anime.trailer?.embed_url && (
                      <Card className="mb-4 shadow-sm">
                        <Card.Header><strong>Trailer</strong></Card.Header>
                        <Card.Body className="p-0">
                          <div className="ratio ratio-16x9">
                            <iframe 
                              src={anime.trailer.embed_url} 
                              title={`${anime.title} trailer`}
                              allowFullScreen
                            ></iframe>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
                {anime.background && (
                  <Card className="mb-4 shadow-sm">
                    <Card.Header><strong>Background</strong></Card.Header>
                    <Card.Body>
                      <Card.Text>{anime.background}</Card.Text>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>

              {/* Characters tab */}
              <Tab.Pane eventKey="characters">
                {loading.characters ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading characters...</span>
                    </Spinner>
                  </div>
                ) : characters.length > 0 ? (
                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {characters.map(characterData => (
                      <Col key={characterData.character.mal_id}>
                        <Card className="h-100 shadow-sm character-card">
                          <Row className="g-0">
                            <Col xs={4}>
                              <Card.Img 
                                src={characterData.character.images?.jpg?.image_url || 'https://via.placeholder.com/100x150'} 
                                alt={characterData.character.name}
                                className="rounded-start"
                                style={{ height: '100%', objectFit: 'cover' }}
                              />
                            </Col>
                            <Col xs={8}>
                              <Card.Body className="p-2">
                                <Card.Title style={{ fontSize: '1rem' }} className="mb-1">
                                  {characterData.character.name}
                                </Card.Title>
                                <Card.Text className="small text-muted mb-1">
                                  {characterData.role || 'Unknown role'}
                                </Card.Text>
                                {characterData.voice_actors?.length > 0 && (
                                  <div className="mt-2">
                                    <small className="fw-bold">VA:</small>
                                    {characterData.voice_actors.slice(0, 1).map(va => (
                                      <div key={va.person.mal_id} className="d-flex align-items-center mt-1">
                                        <img 
                                          src={va.person.images?.jpg?.image_url || 'https://via.placeholder.com/30x30'} 
                                          alt={va.person.name}
                                          className="rounded-circle me-1"
                                          width="25"
                                          height="25"
                                          style={{ objectFit: 'cover' }}
                                        />
                                        <small>{va.person.name}</small>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card.Body>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">No character information available.</Alert>
                )}
              </Tab.Pane>

              {/* Episodes tab */}
              <Tab.Pane eventKey="episodes">
                {loading.episodes ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading episodes...</span>
                    </Spinner>
                  </div>
                ) : episodes.length > 0 ? (
                  <Card className="shadow-sm">
                    <Card.Header>
                      <h5 className="mb-0">Episodes ({episodes.length})</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Title</th>
                              <th>Aired</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {episodes.map(episode => (
                              <tr key={episode.mal_id}>
                                <td>{episode.mal_id}</td>
                                <td>
                                  <div>
                                    <strong>{episode.title}</strong>
                                    {episode.title_japanese && (
                                      <div className="small text-muted">{episode.title_japanese}</div>
                                    )}
                                  </div>
                                </td>
                                <td>{new Date(episode.aired).toLocaleDateString() || 'TBA'}</td>
                                <td>
                                  {episode.score ? (
                                    <span>
                                      <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                      {episode.score.toFixed(1)}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Alert variant="info">No episode information available.</Alert>
                )}
              </Tab.Pane>

              {/* Reviews tab */}
              <Tab.Pane eventKey="reviews">
                {loading.reviews ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading reviews...</span>
                    </Spinner>
                  </div>
                ) : reviews.length > 0 ? (
                  <div>
                    <h5 className="mb-3">Reviews ({reviews.length})</h5>
                    {reviews.map(review => (
                      <Card key={review.mal_id} className="mb-4 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <img 
                              src={review.user.images?.jpg?.image_url || 'https://via.placeholder.com/50x50'} 
                              alt={review.user.username}
                              className="rounded-circle me-2"
                              width="40"
                              height="40"
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-0">{review.user.username}</h6>
                              <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                            </div>
                          </div>
                          <Badge bg="primary" className="p-2">
                            <FontAwesomeIcon icon={faStar} className="me-1" />
                            {review.score}
                          </Badge>
                        </Card.Header>
                        <Card.Body>
                          <div style={{ whiteSpace: 'pre-line' }}>
                            {review.review.length > 500 
                              ? `${review.review.substring(0, 500)}... `
                              : review.review}
                            {review.review.length > 500 && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                href={review.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Read Full Review
                              </Button>
                            )}
                          </div>
                          {review.tags && review.tags.length > 0 && (
                            <div className="mt-3">
                              {review.tags.map((tag, index) => (
                                <Badge key={index} bg="secondary" className="me-1">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No review information available.</Alert>
                )}
              </Tab.Pane>

              {/* Staff tab */}
              <Tab.Pane eventKey="staff">
                {loading.staff ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading staff...</span>
                    </Spinner>
                  </div>
                ) : staff.length > 0 ? (
                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {staff.map(staffMember => (
                      <Col key={`${staffMember.person.mal_id}-${staffMember.positions?.[0] || 'staff'}`}>
                        <Card className="h-100 shadow-sm">
                          <Card.Img 
                            variant="top"
                            src={staffMember.person.images?.jpg?.image_url || 'https://via.placeholder.com/225x318'}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                          <Card.Body>
                            <Card.Title style={{ fontSize: '1rem' }}>{staffMember.person.name}</Card.Title>
                            <Card.Text>
                              <small className="text-muted">
                                {staffMember.positions?.join(', ') || 'Staff Member'}
                              </small>
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">No staff information available.</Alert>
                )}
              </Tab.Pane>

              {/* Stats tab */}
              <Tab.Pane eventKey="stats">
                {loading.stats ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading stats...</span>
                    </Spinner>
                  </div>
                ) : stats ? (
                  <Row>
                    <Col md={6}>
                      <Card className="mb-4 shadow-sm">
                        <Card.Header>
                          <h5 className="mb-0">Score Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                          {stats.scores?.map(score => (
                            <div key={score.score} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{score.score} <FontAwesomeIcon icon={faStar} className="text-warning" /></span>
                                <span>{score.votes?.toLocaleString() || 0} votes ({score.percentage?.toFixed(1) || 0}%)</span>
                              </div>
                              <div className="progress" style={{ height: '24px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  role="progressbar" 
                                  style={{ width: `${score.percentage || 0}%` }} 
                                  aria-valuenow={score.percentage || 0} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                >
                                  {score.percentage?.toFixed(1) || 0}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-4 shadow-sm">
                        <Card.Header>
                          <h5 className="mb-0">Status Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                          <Table responsive>
                            <thead>
                              <tr>
                                <th>Status</th>
                                <th>Count</th>
                                <th>Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Watching</td>
                                <td>{stats.status?.watching?.toLocaleString() || 0}</td>
                                <td>
                                  {stats.status?.watching && stats.status?.total 
                                    ? ((stats.status.watching / stats.status.total) * 100).toFixed(1) 
                                    : 0}%
                                </td>
                              </tr>
                              <tr>
                                <td>Completed</td>
                                <td>{stats.status?.completed?.toLocaleString() || 0}</td>
                                <td>
                                  {stats.status?.completed && stats.status?.total 
                                    ? ((stats.status.completed / stats.status.total) * 100).toFixed(1) 
                                    : 0}%
                                </td>
                              </tr>
                              <tr>
                                <td>On Hold</td>
                                <td>{stats.status?.on_hold?.toLocaleString() || 0}</td>
                                <td>
                                  {stats.status?.on_hold && stats.status?.total 
                                    ? ((stats.status.on_hold / stats.status.total) * 100).toFixed(1) 
                                    : 0}%
                                </td>
                              </tr>
                              <tr>
                                <td>Dropped</td>
                                <td>{stats.status?.dropped?.toLocaleString() || 0}</td>
                                <td>
                                  {stats.status?.dropped && stats.status?.total 
                                    ? ((stats.status.dropped / stats.status.total) * 100).toFixed(1) 
                                    : 0}%
                                </td>
                              </tr>
                              <tr>
                                <td>Plan to Watch</td>
                                <td>{stats.status?.plan_to_watch?.toLocaleString() || 0}</td>
                                <td>
                                  {stats.status?.plan_to_watch && stats.status?.total 
                                    ? ((stats.status.plan_to_watch / stats.status.total) * 100).toFixed(1) 
                                    : 0}%
                                </td>
                              </tr>
                              <tr className="table-active fw-bold">
                                <td>Total</td>
                                <td>{stats.status?.total?.toLocaleString() || 0}</td>
                                <td>100%</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <Alert variant="info">No statistics information available.</Alert>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </>
      ) : (
        <Alert variant="warning">
          Anime not found or unable to load details.
        </Alert>
      )}
    </Container>
  );
}
