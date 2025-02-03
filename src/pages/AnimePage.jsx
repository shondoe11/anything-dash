import { Container } from 'react-bootstrap';
import AnimeWidget from '../widgets/Anime/AnimeWidget';

export default function AnimePage() {
  return (
    <Container>
      <h1 className="my-4">Anime Recommendations</h1>
      <AnimeWidget expandedView={true} />
    </Container>
  );
}