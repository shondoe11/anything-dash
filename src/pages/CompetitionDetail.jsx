//* detail pg fr football competition by id
import { useState, useEffect } from 'react';
import { Container, Tab, Tabs, Row, Col, Card, Table, Spinner, Badge, Alert, Button, Image, Nav } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  fetchCompetitionDetails, 
  fetchFootballData, 
  fetchCompetitionMatches, 
  fetchCompetitionTeams,
  fetchCompetitionScorers
} from '../services/service';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendarAlt, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState({
    competition: true,
    standings: true,
    matches: true,
    teams: true,
    scorers: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [matchFilter, setMatchFilter] = useState('SCHEDULED');
  
  //& compe deets on load
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const data = await fetchCompetitionDetails(id);
        setCompetition(data);
      } catch (error) {
        console.error('Error fetching competition:', error);
        setError('Failed to load competition details');
        toast.error('Failed to load competition details');
      } finally {
        setLoading(prev => ({ ...prev, competition: false }));
      }
    };
    
    fetchCompetition();
  }, [id]);
  
  //& standings
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const data = await fetchFootballData(id);
        setStandings(data.standings?.[0]?.table ?? []); //~ fallback empty arr
      } catch (error) {
        console.error('Error fetching standings:', error);
        toast.error('Failed to load standings');
      } finally {
        setLoading(prev => ({ ...prev, standings: false }));
      }
    };
    
    fetchStandings();
  }, [id]);
  
  //& matches
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(prev => ({ ...prev, matches: true }));
      try {
        //~ get today's date & 30 days in future fr scheduled matches
        const today = new Date().toISOString().split('T')[0];
        let dateTo = new Date();
        dateTo.setDate(dateTo.getDate() + 30);
        dateTo = dateTo.toISOString().split('T')[0];
        
        let dateFrom = null;
        if (matchFilter === 'FINISHED') {
          //~ fr finished matches, get last 30 days
          dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 30);
          dateFrom = dateFrom.toISOString().split('T')[0];
          dateTo = today;
        } else if (matchFilter === 'SCHEDULED') {
          dateFrom = today;
        }
        
        const data = await fetchCompetitionMatches(id, dateFrom, dateTo, matchFilter);
        setMatches(data.matches ?? []); //~ fallback empty arr
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setLoading(prev => ({ ...prev, matches: false }));
      }
    };
    
    if (activeTab === 'matches') {
      fetchMatches();
    }
  }, [id, activeTab, matchFilter]);
  
  //& teams
  useEffect(() => {
    const fetchTeamsList = async () => {
      try {
        const data = await fetchCompetitionTeams(id);
        setTeams(data.teams ?? []); //~ fallback empty arr
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoading(prev => ({ ...prev, teams: false }));
      }
    };
    
    if (activeTab === 'teams') {
      fetchTeamsList();
    }
  }, [id, activeTab]);
  
  //& top scorers
  useEffect(() => {
    const fetchScorers = async () => {
      try {
        const data = await fetchCompetitionScorers(id);
        setTopScorers(data.scorers ?? []); //~ fallback empty arr
      } catch (error) {
        console.error('Error fetching scorers:', error);
        toast.error('Failed to load top scorers');
      } finally {
        setLoading(prev => ({ ...prev, scorers: false }));
      }
    };
    
    if (activeTab === 'scorers') {
      fetchScorers();
    }
  }, [id, activeTab]);
  
  //& format match date
  const formatMatchDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  //& match status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge bg="primary">Scheduled</Badge>;
      case 'LIVE':
      case 'IN_PLAY':
        return <Badge bg="danger">Live</Badge>;
      case 'PAUSED':
        return <Badge bg="warning">Halftime</Badge>;
      case 'FINISHED':
        return <Badge bg="success">Finished</Badge>;
      case 'POSTPONED':
        return <Badge bg="secondary">Postponed</Badge>;
      case 'SUSPENDED':
      case 'CANCELED':
        return <Badge bg="dark">Canceled</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  //& handle team click
  const handleTeamClick = (teamId) => {
    navigate(`/team/${teamId}`);
  };
  
  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
        <Link to="/football">
          <Button variant="primary">Back to Football</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {loading.competition ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : competition ? (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              {competition.emblem && (
                <Image
                  src={competition.emblem}
                  alt={competition.name}
                  height="64"
                  className="me-3"
                />
              )}
              <div>
                <h1 className="mb-0">{competition.name}</h1>
                <p className="text-muted mb-0">{competition.area?.name || ''}</p>
              </div>
            </div>
            <Link to="/football">
              <Button variant="outline-primary">Back to Football</Button>
            </Link>
          </div>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="overview" title={
              <span><FontAwesomeIcon icon={faTrophy} className="me-2" />Overview</span>
            }>
              {loading.standings ? (
                <div className="text-center p-4">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Row>
                  <Col md={8}>
                    <Card className="shadow-sm mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Current Standings</h5>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <Table hover responsive striped className="mb-0">
                          <thead>
                            <tr>
                              <th>Pos</th>
                              <th>Team</th>
                              <th>Played</th>
                              <th>Won</th>
                              <th>Draw</th>
                              <th>Lost</th>
                              <th>GF</th>
                              <th>GA</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {standings?.map((team) => ( //~ guard against undefined standings
                              <tr key={team.team.id} onClick={() => handleTeamClick(team.team.id)} style={{ cursor: 'pointer' }}>
                                <td>{team.position}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {team.team.crest && (
                                      <img
                                        src={team.team.crest}
                                        alt={team.team.name}
                                        height="20"
                                        className="me-2"
                                      />
                                    )}
                                    {team.team.name}
                                  </div>
                                </td>
                                <td>{team.playedGames}</td>
                                <td>{team.won}</td>
                                <td>{team.draw}</td>
                                <td>{team.lost}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td><strong>{team.points}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Competition Info</h5>
                      </Card.Header>
                      <Card.Body>
                        <div><strong>Current Season:</strong> {competition.currentSeason?.startDate?.split('T')[0] ?? 'N/A'} to {competition.currentSeason?.endDate?.split('T')[0] ?? 'N/A'}</div>
                        <div><strong>Current Matchday:</strong> {competition.currentSeason?.currentMatchday ?? 'N/A'}</div>
                        <div><strong>Type:</strong> {competition.type ?? competition.plan ?? 'N/A'}</div>
                        <p><strong>Region:</strong> {competition.area?.name}</p>
                        {competition.code && <p><strong>Code:</strong> {competition.code}</p>}
                        {competition.lastUpdated && (
                          <p><strong>Last Updated:</strong> {new Date(competition.lastUpdated).toLocaleDateString()}</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Tab>
            
            <Tab eventKey="matches" title={
              <span><FontAwesomeIcon icon={faCalendarAlt} className="me-2" />Matches</span>
            }>
              <Card className="shadow-sm mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Matches</h5>
                  <div>
                    <Nav variant="pills" className="d-flex">
                      <Nav.Item>
                        <Nav.Link 
                          className={matchFilter === 'SCHEDULED' ? 'active' : ''}
                          onClick={() => setMatchFilter('SCHEDULED')}
                        >
                          Upcoming
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link 
                          className={matchFilter === 'FINISHED' ? 'active' : ''}
                          onClick={() => setMatchFilter('FINISHED')}
                        >
                          Results
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link 
                          className={matchFilter === 'LIVE' ? 'active' : ''}
                          onClick={() => setMatchFilter('LIVE')}
                        >
                          Live
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loading.matches ? (
                    <div className="text-center p-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading matches...</span>
                      </Spinner>
                    </div>
                  ) : matches?.length > 0 ? (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Home</th>
                          <th>Score</th>
                          <th>Away</th>
                          <th>Matchday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches?.map((match) => ( //~ guard against undefined matches
                          <tr key={match.id}>
                            <td>{formatMatchDate(match.utcDate)}</td>
                            <td>{getStatusBadge(match.status)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {match.homeTeam.crest && (
                                  <img
                                    src={match.homeTeam.crest}
                                    alt={match.homeTeam.name}
                                    height="20"
                                    className="me-2"
                                  />
                                )}
                                {match.homeTeam.name}
                              </div>
                            </td>
                            <td className="text-center">
                              {match.status === 'SCHEDULED' ? (
                                '-'
                              ) : (
                                <strong>{match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? '-'} - {match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? '-'}</strong>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {match.awayTeam.crest && (
                                  <img
                                    src={match.awayTeam.crest}
                                    alt={match.awayTeam.name}
                                    height="20"
                                    className="me-2"
                                  />
                                )}
                                {match.awayTeam.name}
                              </div>
                            </td>
                            <td>{match.matchday}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      No {matchFilter.toLowerCase()} matches found for this competition.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="teams" title={
              <span><FontAwesomeIcon icon={faUsers} className="me-2" />Teams</span>
            }>
              {loading.teams ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading teams...</span>
                  </Spinner>
                </div>
              ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {teams?.map((team) => ( //~ guard against undefined teams
                    <Col key={team.id}>
                      <Card className="h-100 shadow-sm" onClick={() => handleTeamClick(team.id)} style={{ cursor: 'pointer' }}>
                        <Card.Header className="text-center">
                          {team.crest && (
                            <img
                              src={team.crest}
                              alt={team.name}
                              height="60"
                              className="my-2"
                            />
                          )}
                        </Card.Header>
                        <Card.Body>
                          <Card.Title className="text-center">{team.name}</Card.Title>
                          <Card.Text as="div" className="small">
                            <div><strong>Founded:</strong> {team.founded}</div>
                            <div><strong>Stadium:</strong> {team.venue}</div>
                            <div><strong>Website:</strong> {team.website ? (
                              <a href={team.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                Visit
                              </a>
                            ) : 'N/A'}</div>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>
            
            <Tab eventKey="scorers" title={
              <span><FontAwesomeIcon icon={faUserPlus} className="me-2" />Top Scorers</span>
            }>
              {loading.scorers ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading scorers...</span>
                  </Spinner>
                </div>
              ) : (
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Top Scorers</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive striped className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Player</th>
                          <th>Team</th>
                          <th>Goals</th>
                          <th>Assists</th>
                          <th>Penalties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topScorers?.map((scorer, index) => ( //~ guard against undefined topScorers
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{scorer.player.name}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {scorer.team.crest && (
                                  <img
                                    src={scorer.team.crest}
                                    alt={scorer.team.name}
                                    height="20"
                                    className="me-2"
                                  />
                                )}
                                {scorer.team.name}
                              </div>
                            </td>
                            <td>{scorer.goals}</td>
                            <td>{scorer.assists || '-'}</td>
                            <td>{scorer.penalties || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Tab>
          </Tabs>
        </>
      ) : (
        <Alert variant="warning">
          Competition not found or unable to load details.
        </Alert>
      )}
    </Container>
  );
}
