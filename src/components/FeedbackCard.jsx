import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function FeedbackCard() {
  return (
    <Card className="widget-card homepage-card">
      <Card.Body>
        <Card.Title>We value your feedback</Card.Title>
        <Card.Text>Let us know how we can improve Anything Dash.</Card.Text>
        <Button as={Link} to="/feedback" variant="primary">
          Give Feedback
        </Button>
      </Card.Body>
    </Card>
  );
}
