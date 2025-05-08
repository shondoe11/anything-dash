import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Nav, Tab, Alert, Button, Image } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { fetchTeamDetails, fetchTeamMatches } from '../services/service';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState({
    team: true,
    matches: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [matchFilter, setMatchFilter] = useState('SCHEDULED');

  //~ team details on load
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await fetchTeamDetails(id);
        setTeam(data);
      } catch (error) {
        console.error('Error fetching team:', error);
        setError('Failed to load team details');
        toast.error('Failed to load team details');
      } finally {
        setLoading(prev => ({ ...prev, team: false }));
      }
    };
    
    fetchTeam();
  }, [id]);

  //& team matches
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(prev => ({ ...prev, matches: true }));
      try {
        //~ date ranges based on filter
        const today = new Date().toISOString().split('T')[0];
        let dateFrom = null;
        let dateTo = null;
        
        if (matchFilter === 'SCHEDULED') {
          dateFrom = today;
          let futureDateTo = new Date();
          futureDateTo.setDate(futureDateTo.getDate() + 60); //~ next 60d
          dateTo = futureDateTo.toISOString().split('T')[0];
        } else if (matchFilter === 'FINISHED') {
          let pastDateFrom = new Date();
          pastDateFrom.setDate(pastDateFrom.getDate() - 60); //~ past 60d
          dateFrom = pastDateFrom.toISOString().split('T')[0];
          dateTo = today;
        }
        
        const data = await fetchTeamMatches(id, matchFilter, dateFrom, dateTo);
        setMatches(data.matches);
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

  //~ format match date
  const formatMatchDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  //~ match status badge
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
      {loading.team ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : team ? (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              {team.crest && (
                <Image
                  src={team.crest}
                  alt={team.name}
                  height="80"
                  className="me-3"
                />
              )}
              <div>
                <h1 className="mb-0">{team.name}</h1>
                <p className="text-muted mb-0">
                  {team.area?.name || ''} {team.founded ? `• Founded ${team.founded}` : ''}
                </p>
              </div>
            </div>
            <Link to="/football">
              <Button variant="outline-primary">Back to Football</Button>
            </Link>
          </div>
          
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Row className="mb-3">
              <Col>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="overview"
                      className={activeTab === 'overview' ? 'active' : ''}
                    >
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="matches"
                      className={activeTab === 'matches' ? 'active' : ''}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      Matches
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <Row>
                      <Col md={8}>
                        <Card className="shadow-sm mb-4">
                          <Card.Header>
                            <h5 className="mb-0">Squad</h5>
                          </Card.Header>
                          <Card.Body className="p-0">
                            {team.squad && team.squad.length > 0 ? (
                              <Table hover responsive striped className="mb-0">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Nationality</th>
                                    <th>Birth</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {team.squad.map((player) => (
                                    <tr key={player.id}>
                                      <td>{player.name}</td>
                                      <td>{player.position || 'N/A'}</td>
                                      <td>{player.nationality}</td>
                                      <td>{player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <Alert variant="info" className="m-3">No squad information available.</Alert>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="shadow-sm mb-4">
                          <Card.Header>
                            <h5 className="mb-0">Team Info</h5>
                          </Card.Header>
                          <Card.Body>
                            <p>
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                              <strong>Stadium:</strong> {team.venue}
                            </p>
                            <p><strong>Address:</strong> {team.address || 'N/A'}</p>
                            <p><strong>Website:</strong> {team.website ? (
                              <a href={team.website} target="_blank" rel="noopener noreferrer">
                                {team.website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : 'N/A'}</p>
                            <p><strong>Phone:</strong> {team.phone || 'N/A'}</p>
                            <p><strong>Email:</strong> {team.email || 'N/A'}</p>
                            <p><strong>Colors:</strong> {team.clubColors || 'N/A'}</p>
                            <p><strong>Last Updated:</strong> {team.lastUpdated ? new Date(team.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                          </Card.Body>
                        </Card>
                        
                        <Card className="shadow-sm mb-4">
                          <Card.Header>
                            <h5 className="mb-0">Coach</h5>
                          </Card.Header>
                          <Card.Body>
                            {team.coach ? (
                              <>
                                <p><strong>Name:</strong> {team.coach.name}</p>
                                <p><strong>Nationality:</strong> {team.coach.nationality}</p>
                                <p><strong>Date of Birth:</strong> {team.coach.dateOfBirth ? new Date(team.coach.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                              </>
                            ) : (
                              <p>No coach information available.</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="matches">
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
                                <th>Competition</th>
                                <th>Home</th>
                                <th>Score</th>
                                <th>Away</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {matches.map((match) => (
                                <tr key={match.id}>
                                  <td>{formatMatchDate(match.utcDate)}</td>
                                  <td>
                                    <Link to={`/competition/${match.competition.id}`}>
                                      {match.competition.name}
                                    </Link>
                                  </td>
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
                                      <span className={match.homeTeam.id === parseInt(id) ? 'fw-bold' : ''}>
                                        {match.homeTeam.name}
                                      </span>
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
                                      <span className={match.awayTeam.id === parseInt(id) ? 'fw-bold' : ''}>
                                        {match.awayTeam.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td>{getStatusBadge(match.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <Alert variant="info">
                            No {matchFilter.toLowerCase()} matches found for this team.
                          </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </>
      ) : (
        <Alert variant="warning">
          Team not found or unable to load details.
        </Alert>
      )}
    </Container>
  );
}
