import { useState, useEffect } from 'react';
import { Spinner, Alert, Image, Badge, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { getTrendingCoins } from '../../services/service';
import './TrendingBar.css';

//& trending bar component show hot coins
export default function TrendingBar() {
  const [coins, setCoins] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTrendingCoins()
      .then(data => {
        setCoins(data);
        setLastUpdated(new Date());
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-3"><Spinner /></div>;
  if (error) return <Alert variant="danger">failed to load trending coins.</Alert>;

  return (
    <Card className="mb-4">
      <Card.Header>
        <Row className="align-items-center">
          <Col xs="auto">
            <FontAwesomeIcon icon={faFire} className="me-2" />
            <small>Hot Coins</small>
          </Col>
          <Col className="text-end">
            <small className="text-muted">
              Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : '-'}
            </small>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-wrap justify-content-start">
          {coins.slice(0, 15).map((coin, index) => (
            <div key={coin.id} className="position-relative m-2 coin-card d-flex flex-column align-items-center text-center">
              <Badge bg="light" text="dark" pill className="position-absolute top-0 start-0" style={{ zIndex: 1 }}>
                {index + 1}
              </Badge>
              <a
                href={`https://www.coingecko.com/en/coins/${coin.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={coin.large}
                  roundedCircle
                  width={60}
                  height={60}
                  alt={coin.name}
                />
              </a>
              <Badge bg="light" text="dark" pill className="mt-2 px-2 py-1 small w-100">
                <strong>{coin.symbol.toUpperCase()}</strong>
              </Badge>
              <Badge bg="light" text="dark" pill className="mt-1 px-2 py-1 small w-100">
                MC Rank: <strong>{coin.market_cap_rank}</strong>
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 small text-muted text-center">
          <div><strong>MC Rank</strong>: Market capitalization rank</div>
        </div>
      </Card.Body>
    </Card>
  );
}
