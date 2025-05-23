import { Container, Row, Col } from 'react-bootstrap';
import FeedbackForm from '../components/FeedbackForm';

export default function FeedbackPage() {
  return (
    <Container className="my-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <h1>Feedback</h1>
          <FeedbackForm />
        </Col>
      </Row>
    </Container>
  );
}
