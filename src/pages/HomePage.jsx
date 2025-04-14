import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1>Welcome to Anything Dash!</h1>
          <p>
            Your one-stop dashboard for managing tasks, checking the weather, tracking cryptocurrency, and more.
            Explore the widgets below or use the navigation bar at the top to jump directly to your area of interest.
          </p>
          <br />
          <p>** If you are not sure what to navigate first, click &apos;Dashboard&apos; above to see everything implemented so far!</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Task Management</Card.Title>
              <Card.Text>
                View and manage your to-do list. Add new tasks, edit existing ones, and mark them as completed.
              </Card.Text>
              <Button as={Link} to="/todo" variant="primary">
                Go to Tasks
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Weather Forecast</Card.Title>
              <Card.Text>
                Check current weather conditions and view a 4-day forecast. Search by country or Singapore town.
              </Card.Text>
              <Button as={Link} to="/weather" variant="primary">
                Go to Weather
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Cryptocurrency Data</Card.Title>
              <Card.Text>
                Get the latest information on cryptocurrencies, including prices and market trends.
              </Card.Text>
              <Button as={Link} to="/crypto" variant="primary">
                Go to Crypto
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Football Fixtures</Card.Title>
              <Card.Text>
                Stay up-to-date with the latest football fixtures and standings from your favorite leagues.
              </Card.Text>
              <Button as={Link} to="/football" variant="primary">
                Go to Football
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Anime Recommendations</Card.Title>
              <Card.Text>
                Discover top airing anime and easily add your favorites to your to-do list.
              </Card.Text>
              <Button as={Link} to="/anime" variant="primary">
                Go to Anime
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <p>
            Use the navigation bar at the top to quickly switch between different sections.
          </p>
        </Col>
      </Row>
    </Container>
  );
}
