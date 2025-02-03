import { Container } from 'react-bootstrap';
import FootballWidget from '../widgets/Football/FootballWidget';

export default function FootballPage() {
  return (
    <Container>
      <h1 className="my-4">Football Fixtures</h1>
      <FootballWidget expandedView={true} />
    </Container>
  );
}