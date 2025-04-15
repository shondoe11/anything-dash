import { Container, Card, Badge } from 'react-bootstrap';
import TodoWidget from '../widgets/Todo/TodoWidget';
import WeatherWidget from '../widgets/Weather/WeatherWidget';
import CryptoWidget from '../widgets/Crypto/CryptoWidget';
import FootballWidget from '../widgets/Football/FootballWidget';
import AnimeWidget from '../widgets/Anime/AnimeWidget';
import { useState } from 'react';
import { FaHome } from 'react-icons/fa';

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTodoList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container>
      <Card className="border-0 shadow-sm mb-4 widget-card overflow-hidden mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4" 
          style={{background: 'linear-gradient(45deg, var(--primary), var(--secondary))', border: 'none'}}>
          <div className="d-flex align-items-center">
            <FaHome className="text-white me-2 widget-icon" size={24} />
            <h3 className="mb-0 text-white fw-bold">My Dashboard</h3>
          </div>
          <div>
            <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
              {new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
            </Badge>
          </div>
        </Card.Header>
      </Card>
      <WeatherWidget />
      <div className="my-4">
        <TodoWidget expandedView={false} refreshTrigger={refreshTrigger} />
      </div>
      <div className="my-4">
        <CryptoWidget />
      </div>
      <div className="my-4">
        <FootballWidget />
      </div>
      <AnimeWidget refreshTodoList={refreshTodoList} />
    </Container>
  );
}