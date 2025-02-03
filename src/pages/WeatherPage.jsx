import { Container } from 'react-bootstrap';
import WeatherWidget from '../widgets/Weather/WeatherWidget';

export default function WeatherPage() {
  return (
    <Container>
      <h1 className="my-4">Weather Forecast</h1>
      <WeatherWidget expandedView={true} />
    </Container>
  );
}