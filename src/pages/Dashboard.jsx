import { Container } from 'react-bootstrap';
import TodoWidget from '../widgets/Todo/TodoWidget';
import WeatherWidget from '../widgets/Weather/WeatherWidget';
import CryptoWidget from '../widgets/Crypto/CryptoWidget';
import FootballWidget from '../widgets/Football/FootballWidget';
import AnimeWidget from '../widgets/Anime/AnimeWidget';
import { useState } from 'react';

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTodoList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Container>
      <h1 className="my-4">My Dashboard</h1>
      <WeatherWidget />
      <div className="d-flex gap-3 my-4">
        <CryptoWidget />
        <TodoWidget expandedView={false} refreshTrigger={refreshTrigger} />
        <FootballWidget  />
      </div>
      <AnimeWidget refreshTodoList={refreshTodoList} />
    </Container>
  );
}