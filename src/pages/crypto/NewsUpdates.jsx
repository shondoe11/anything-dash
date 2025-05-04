import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Form, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { getCoinStatusUpdates } from '../../services/service';

//& display news & status updates fr coin
export default function NewsUpdates() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  //& common coins selection
  const coinOptions = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)' },
    { value: 'ethereum', label: 'Ethereum (ETH)' },
    { value: 'ripple', label: 'XRP' },
    { value: 'cardano', label: 'Cardano (ADA)' },
    { value: 'solana', label: 'Solana (SOL)' }
  ];

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    getCoinStatusUpdates(selectedCoin)
      .then(data => { if (active) setUpdates(data); })
      .catch(err => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [selectedCoin]);

  //& format date relative to now
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
      return date.toLocaleDateString();
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  //& get badge fr category
  const getCategoryBadge = (category) => {
    if (!category) return null;
    
    const categories = {
      'general': 'primary',
      'milestone': 'success',
      'partnership': 'info',
      'exchange_listing': 'warning',
      'software_release': 'secondary',
      'fund_movement': 'danger',
      'event': 'dark'
    };
    
    const variant = categories[category.toLowerCase()] || 'light';
    return <Badge bg={variant} className="me-2">{category}</Badge>;
  };

  return (
    <Card className="my-4">
      <Card.Header>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faNewspaper} className="me-2" />
              <small className="mb-0">News & Status Updates</small>
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="mb-1">Coin</Form.Label>
              <Form.Select 
                size="sm" 
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
              >
                {coinOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
        {error && <p className="text-danger">Failed to load news and updates data.</p>}
        
        {!loading && !error && updates.length > 0 && (
          <ListGroup>
            {updates.map((update, index) => (
              <ListGroup.Item key={index} className="border-start-0 border-end-0">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    {getCategoryBadge(update.category)}
                    <small className="text-muted">
                      {formatRelativeDate(update.created_at)}
                    </small>
                  </div>
                  {update.user && (
                    <small className="text-muted">
                      via {update.user}
                    </small>
                  )}
                </div>
                <div className="mb-1">{update.description}</div>
                {update.project && (
                  <small className="text-muted">Project: {update.project.name}</small>
                )}
                {update.url && (
                  <div className="mt-2">
                    <a href={update.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      Read More
                    </a>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        
        {!loading && !error && updates.length === 0 && (
          <p className="text-center">No news or updates available for this coin.</p>
        )}
      </Card.Body>
    </Card>
  );
}
