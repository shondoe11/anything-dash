import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Spinner, Table, Badge, Button, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FootballWidget from '../widgets/Football/FootballWidget';
import { fetchCompetitionDetails, fetchCompetitionMatches, fetchCompetitionScorers } from '../services/service';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFutbol, faCalendarAlt, faUserPlus, faList, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const competitions = [
    {id: 'WC', name: 'FIFA World Cup'},
    {id: 'CL', name: 'UEFA Champions League'},
    {id: 'BL1', name: 'Bundesliga'},
    {id: 'DED', name: 'Eredivisie'},
    {id: 'BSA', name: 'Campeonato Brasileiro Série A'},
    {id: 'PD', name: 'Primera Division'},
    {id: 'FL1', name: 'Ligue 1'},
    {id: 'ELC', name: 'Championship'},
    {id: 'PPL', name: 'Primeira Liga'},
    {id: 'EC', name: 'European Championship'},
    {id: 'SA', name: 'Serie A'},
    {id: 'PL', name: 'Premier League'},
    {id: 'CLI', name: 'Copa Libertadores'},
];

export default function FootballPage() {
  const navigate = useNavigate();
  const [selectedCompetition, setSelectedCompetition] = useState('PL');
  const [activeTab, setActiveTab] = useState('standings');
  const [competitionInfo, setCompetitionInfo] = useState(null);
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState({
    competition: false,
    matches: false,
    scorers: false
  });
  const [navCollapsed, setNavCollapsed] = useState(false); //~ collapse nav on mobile
  
  //~ collapse nav by default on mobile screens
  useEffect(() => {
    if (window.innerWidth < 768) setNavCollapsed(true);
  }, []);

  //& compe deets whn selected compe changes
  useEffect(() => {
    const fetchCompetition = async () => {
      setLoading(prev => ({ ...prev, competition: true }));
      try {
        const data = await fetchCompetitionDetails(selectedCompetition);
        setCompetitionInfo(data);
      } catch (error) {
        console.error('Error fetching competition:', error);
        toast.error('Failed to load competition details');
      } finally {
        setLoading(prev => ({ ...prev, competition: false }));
      }
    };
    
    fetchCompetition();
  }, [selectedCompetition]);
  
  //& upcoming matches whn selected compe changes / tab changes
  useEffect(() => {
    const fetchMatches = async () => {
      if (activeTab !== 'matches') return;
      
      setLoading(prev => ({ ...prev, matches: true }));
      try {
        //~ get today's date & 14d in future
        const today = new Date().toISOString().split('T')[0];
        let dateTo = new Date();
        dateTo.setDate(dateTo.getDate() + 14);
        dateTo = dateTo.toISOString().split('T')[0];
        
        const data = await fetchCompetitionMatches(selectedCompetition, today, dateTo, 'SCHEDULED');
        setMatches(data.matches?.slice(0, 15) || []); //~ limit 15 matches
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setLoading(prev => ({ ...prev, matches: false }));
      }
    };
    
    fetchMatches();
  }, [selectedCompetition, activeTab]);
  
  //& top scorers whn selected compe changes / tab changes
  useEffect(() => {
    const fetchScorers = async () => {
      if (activeTab !== 'scorers') return;
      
      setLoading(prev => ({ ...prev, scorers: true }));
      try {
        const data = await fetchCompetitionScorers(selectedCompetition);
        setTopScorers(data.scorers || []);
      } catch (error) {
        console.error('Error fetching scorers:', error);
        toast.error('Failed to load top scorers');
      } finally {
        setLoading(prev => ({ ...prev, scorers: false }));
      }
    };
    
    fetchScorers();
  }, [selectedCompetition, activeTab]);
  
  //& format match dates
  const formatMatchDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleCompetitionChange = (compId) => {
    setSelectedCompetition(compId);
    if (window.innerWidth < 768) setNavCollapsed(true);
  };
  
  const navigateToCompetition = () => {
    navigate(`/football/competition/${selectedCompetition}`);
  };
  
  const handleTeamClick = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  return (
    <Container>
      <h1 className="my-4">Football Portal</h1>
      
      <div className="mb-4">
        <p className="lead">Explore competitions, view upcoming matches, and discover top scorers across Europe&apos;s top leagues.</p>
      </div>
      
      <Row>
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Header
              onClick={() => setNavCollapsed(!navCollapsed)}
              style={{ cursor: 'pointer' }}
              className="bg-dark text-white d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faList} className="me-2" />
                <h5 className="mb-0">Competitions</h5>
              </div>
              <FontAwesomeIcon icon={navCollapsed ? faChevronDown : faChevronUp} />
            </Card.Header>
            <Collapse in={!navCollapsed}>
              <Card.Body className="p-0">
                <Nav className="flex-column" variant="pills">
                  {competitions.map(comp => (
                    <Nav.Item key={comp.id}>
                      <Nav.Link 
                        active={selectedCompetition === comp.id}
                        onClick={() => handleCompetitionChange(comp.id)}
                        className="rounded-0 border-bottom"
                        style={{ whiteSpace: 'nowrap' }} //~ prevent wrapping long names
                      >
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        {comp.name}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Body>
            </Collapse>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFutbol} className="me-2" />
                <h5 className="mb-0">{competitionInfo?.name || 'Loading...'}</h5>
              </div>
              <Button variant="light" size="sm" onClick={navigateToCompetition}>View Full Details</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav variant="tabs" className="px-3 pt-2" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="standings">Standings</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="matches">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Upcoming Matches
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="scorers">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Top Scorers
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content className="p-3">
                <Tab.Pane eventKey="standings" className="p-0">
                  <FootballWidget expandedView={true} />
                </Tab.Pane>
                
                <Tab.Pane eventKey="matches" className="p-3">
                  {loading.matches ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading matches...</span>
                      </Spinner>
                    </div>
                  ) : matches.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Home</th>
                          <th></th>
                          <th>Away</th>
                          <th>Matchday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map(match => (
                          <tr key={match.id}>
                            <td>{formatMatchDate(match.utcDate)}</td>
                            <td>
                              <div className="d-flex align-items-center" 
                                    onClick={() => handleTeamClick(match.homeTeam.id)} 
                                    style={{cursor: 'pointer'}}>
                                {match.homeTeam.crest && (
                                  <img 
                                    src={match.homeTeam.crest} 
                                    alt={match.homeTeam.shortName} 
                                    height="20" 
                                    className="me-2" 
                                  />
                                )}
                                {match.homeTeam.name}
                              </div>
                            </td>
                            <td className="text-center">vs</td>
                            <td>
                              <div className="d-flex align-items-center"
                                    onClick={() => handleTeamClick(match.awayTeam.id)}
                                    style={{cursor: 'pointer'}}>
                                {match.awayTeam.crest && (
                                  <img 
                                    src={match.awayTeam.crest} 
                                    alt={match.awayTeam.shortName} 
                                    height="20" 
                                    className="me-2" 
                                  />
                                )}
                                {match.awayTeam.name}
                              </div>
                            </td>
                            <td>
                              <Badge bg="secondary">
                                Matchday {match.matchday}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>No upcoming matches found for this competition.</p>
                    </div>
                  )}
                </Tab.Pane>
                
                <Tab.Pane eventKey="scorers" className="p-3">
                  {loading.scorers ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading scorers...</span>
                      </Spinner>
                    </div>
                  ) : topScorers.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>Team</th>
                          <th>Goals</th>
                          <th>Assists</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topScorers.map((scorer, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{scorer.player.name}</td>
                            <td>
                              <div className="d-flex align-items-center"
                                    onClick={() => handleTeamClick(scorer.team.id)}
                                    style={{cursor: 'pointer'}}>
                                {scorer.team.crest && (
                                  <img 
                                    src={scorer.team.crest} 
                                    alt={scorer.team.shortName} 
                                    height="20" 
                                    className="me-2" 
                                  />
                                )}
                                {scorer.team.name}
                              </div>
                            </td>
                            <td>{scorer.goals}</td>
                            <td>{scorer.assists || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>No top scorer information available for this competition.</p>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}