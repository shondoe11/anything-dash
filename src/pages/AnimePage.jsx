import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Spinner, Form, InputGroup, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AnimeWidget from '../widgets/Anime/AnimeWidget';
import { fetchSeasonalAnime, searchAnime, fetchAnimeRecommendations, fetchAnimeGenres } from '../services/service';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSearch, faCalendarAlt, faListUl, faTags } from '@fortawesome/free-solid-svg-icons';

export default function AnimePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending');
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [animeGenres, setAnimeGenres] = useState([]);
  const [loading, setLoading] = useState({
    seasonal: false,
    recommendations: false,
    search: false,
    genres: false
  });
  
  //& search params
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [currentSeason] = useState(() => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return 'winter';
    else if (month >= 3 && month <= 5) return 'spring';
    else if (month >= 6 && month <= 8) return 'summer';
    else return 'fall';
  });
  const [currentYear] = useState(() => new Date().getFullYear());
  
  //& fetch genres fr search filter
  useEffect(() => {
    const fetchGenres = async () => {
      if (activeTab !== 'search') return;
      
      setLoading(prev => ({ ...prev, genres: true }));
      try {
        const data = await fetchAnimeGenres();
        setAnimeGenres(data.data || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(prev => ({ ...prev, genres: false }));
      }
    };
    
    fetchGenres();
  }, [activeTab]);
  
  //& fetch seasonal anime
  useEffect(() => {
    const fetchSeasonal = async () => {
      if (activeTab !== 'seasonal') return;
      
      setLoading(prev => ({ ...prev, seasonal: true }));
      try {
        const data = await fetchSeasonalAnime(currentYear, currentSeason);
        setSeasonalAnime(data.data || []);
      } catch (error) {
        console.error('Error fetching seasonal anime:', error);
        toast.error('Failed to load seasonal anime');
      } finally {
        setLoading(prev => ({ ...prev, seasonal: false }));
      }
    };
    
    fetchSeasonal();
  }, [activeTab, currentYear, currentSeason]);
  
  //& fetch reccos
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (activeTab !== 'recommendations') return;
      
      setLoading(prev => ({ ...prev, recommendations: true }));
      try {
        const data = await fetchAnimeRecommendations();
        
        //~ process reccos more usable format
        const processedRecommendations = data.data?.slice(0, 15).flatMap(rec => {
          const { entry } = rec;
          return entry.map(anime => ({
            id: anime.mal_id,
            title: anime.title,
            image: anime.images?.jpg?.image_url,
            recommendationCount: rec.content?.slice(0, 5) || '1 users'
          }));
        }) || [];
        
        setRecommendations(processedRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast.error('Failed to load anime recommendations');
      } finally {
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    };
    
    fetchRecommendations();
  }, [activeTab]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(prev => ({ ...prev, search: true }));
    try {
      //~ prep genres string if selected
      const genresParam = selectedGenres.length > 0 ? selectedGenres.join(',') : null;
      
      const data = await searchAnime(
        searchQuery,
        1,
        selectedType || null,
        selectedStatus || null,
        null,  //~ rating
        genresParam,
        'score',  //~ order by score
        'desc'    //~ descending order
      );
      
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Error searching anime:', error);
      toast.error('Failed to search anime');
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };
  
  const handleAnimeClick = (animeId) => {
    navigate(`/anime/${animeId}`);
  };
  
  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  return (
    <Container>
      <h1 className="my-4">Anime Portal</h1>
      
      <div className="mb-4">
        <p className="lead">Discover trending anime, explore seasonal shows, and find recommendations based on your interests.</p>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <Nav variant="tabs" className="card-header-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav.Item>
              <Nav.Link eventKey="trending" className="text-white">
                <FontAwesomeIcon icon={faStar} className="me-2" />
                Trending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="seasonal" className="text-white">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Seasonal ({currentSeason} {currentYear})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="recommendations" className="text-white">
                <FontAwesomeIcon icon={faListUl} className="me-2" />
                Recommendations
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="search" className="text-white">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Search
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Body className="p-0">
          <Tab.Content>
            <Tab.Pane eventKey="trending" className="p-0">
              <AnimeWidget expandedView={true} />
            </Tab.Pane>
            
            <Tab.Pane eventKey="seasonal" className="p-3">
              {loading.seasonal ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading seasonal anime...</span>
                  </Spinner>
                </div>
              ) : seasonalAnime.length > 0 ? (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {seasonalAnime.map(anime => (
                    <Col key={anime.mal_id}>
                      <Card 
                        className="h-100 shadow-sm anime-card" 
                        onClick={() => handleAnimeClick(anime.mal_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Img 
                          variant="top" 
                          src={anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318'}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                          <Card.Title className="text-truncate" style={{ fontSize: '1rem' }}>
                            {anime.title}
                          </Card.Title>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="info">{anime.type || 'N/A'}</Badge>
                            <div>
                              <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                              {anime.score?.toFixed(1) || 'N/A'}
                            </div>
                          </div>
                          <small className="text-muted d-block mt-2">
                            Episodes: {anime.episodes || 'TBA'}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">No seasonal anime found.</Alert>
              )}
            </Tab.Pane>
            
            <Tab.Pane eventKey="recommendations" className="p-3">
              {loading.recommendations ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading recommendations...</span>
                  </Spinner>
                </div>
              ) : recommendations.length > 0 ? (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {recommendations.map((anime, index) => (
                    <Col key={`${anime.id}-${index}`}>
                      <Card 
                        className="h-100 shadow-sm anime-card" 
                        onClick={() => handleAnimeClick(anime.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Img 
                          variant="top" 
                          src={anime.image || 'https://via.placeholder.com/225x318'}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                          <Card.Title className="text-truncate" style={{ fontSize: '1rem' }}>
                            {anime.title}
                          </Card.Title>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <Badge bg="success">Recommended</Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">No recommendations found.</Alert>
              )}
            </Tab.Pane>
            
            <Tab.Pane eventKey="search" className="p-3">
              <div className="mb-4">
                <Card className="mb-3">
                  <Card.Header>
                    <h5 className="mb-0"><FontAwesomeIcon icon={faSearch} className="me-2" />Search Anime</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label>Search Query</Form.Label>
                          <InputGroup>
                            <Form.Control 
                              type="text" 
                              placeholder="Enter anime title..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button variant="primary" onClick={handleSearch}>
                              <FontAwesomeIcon icon={faSearch} />
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Type</Form.Label>
                          <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                            <option value="">Any Type</option>
                            <option value="tv">TV</option>
                            <option value="movie">Movie</option>
                            <option value="ova">OVA</option>
                            <option value="special">Special</option>
                            <option value="ona">ONA</option>
                            <option value="music">Music</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Status</Form.Label>
                          <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">Any Status</option>
                            <option value="airing">Currently Airing</option>
                            <option value="complete">Completed</option>
                            <option value="upcoming">Upcoming</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label><FontAwesomeIcon icon={faTags} className="me-1" /> Genres</Form.Label>
                          <div className="d-flex flex-wrap gap-2 mt-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {loading.genres ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              animeGenres.map(genre => (
                                <Badge 
                                  key={genre.mal_id} 
                                  bg={selectedGenres.includes(genre.mal_id) ? 'primary' : 'secondary'}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleGenreToggle(genre.mal_id)}
                                >
                                  {genre.name}
                                </Badge>
                              ))
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                
                {loading.search ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Searching anime...</span>
                    </Spinner>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <h5 className="mb-3">Search Results ({searchResults.length})</h5>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                      {searchResults.map(anime => (
                        <Col key={anime.mal_id}>
                          <Card 
                            className="h-100 shadow-sm anime-card" 
                            onClick={() => handleAnimeClick(anime.mal_id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Card.Img 
                              variant="top" 
                              src={anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318'}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <Card.Body>
                              <Card.Title className="text-truncate" style={{ fontSize: '1rem' }}>
                                {anime.title}
                              </Card.Title>
                              <div className="d-flex justify-content-between align-items-center">
                                <Badge bg="info">{anime.type || 'N/A'}</Badge>
                                <div>
                                  <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                  {anime.score?.toFixed(1) || 'N/A'}
                                </div>
                              </div>
                              <small className="text-muted d-block mt-2">
                                Episodes: {anime.episodes || 'TBA'}
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                ) : searchQuery ? (
                  <Alert variant="info">No results found for your search criteria.</Alert>
                ) : null}
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>
    </Container>
  );
}