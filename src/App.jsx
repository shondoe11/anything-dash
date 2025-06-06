import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import TodoPage from './pages/TodoPage';
import WeatherPage from './pages/WeatherPage';
import WeatherDetail from './pages/WeatherDetail';
import CryptoPage from './pages/CryptoPage';
import CryptoDetail from './pages/CryptoDetail';
import FootballPage from './pages/FootballPage';
import CompetitionDetail from './pages/CompetitionDetail';
import AnimePage from './pages/AnimePage';
import AnimeDetail from './pages/AnimeDetail';
import HomePage from './pages/HomePage';
import NewTodoPage from './pages/NewTodoPage';
import FeedbackPage from './pages/FeedbackPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import useTheme from './hooks/useTheme';

//~ CSS imports
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';

//& wrapper: inject theme in ToastContainer
function ThemedToastContainer(props) {
  const { theme } = useTheme();
  return <ToastContainer {...props} theme={theme} />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Container className="py-4 px-md-4 fade-in">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/anything" element={<Dashboard />} />
                <Route path="/todo" element={<TodoPage />} />
                <Route path="/todo/new" element={<NewTodoPage />} />
                <Route path="/todo/edit/:id" element={<TodoPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/weather/:country" element={<WeatherDetail />} />
                <Route path="/crypto" element={<CryptoPage />} />
                <Route path="/crypto/:symbol" element={<CryptoDetail />} />
                <Route path="/football" element={<FootballPage />} />
                <Route path="/football/competition/:id" element={<CompetitionDetail />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/anime/:id" element={<AnimeDetail />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Routes>
            </Container>
          </main>
          <ThemedToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;