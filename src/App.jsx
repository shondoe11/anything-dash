import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import TodoPage from './pages/TodoPage';
import EditTodoPage from './pages/EditTodoPage';
import WeatherPage from './pages/WeatherPage';
import CryptoPage from './pages/CryptoPage';
import FootballPage from './pages/FootballPage';
import AnimePage from './pages/AnimePage';
import './App.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './pages/HomePage';
import NewTodoPage from './pages/NewTodoPage';

function App() {
  return (
    <>
      <Navbar />
      <Container className="py-4">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/anything" element={<Dashboard />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/todo/new" element={<NewTodoPage />} />
        <Route path="/todo/edit" element={<EditTodoPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/crypto" element={<CryptoPage />} />
        <Route path="/football" element={<FootballPage />} />
        <Route path="/anime" element={<AnimePage />} />
      </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;