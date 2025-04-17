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
import HomePage from './pages/HomePage';
import NewTodoPage from './pages/NewTodoPage';
import { ThemeProvider } from './context/ThemeContext';
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
              <Route path="/todo/edit" element={<EditTodoPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/crypto" element={<CryptoPage />} />
              <Route path="/football" element={<FootballPage />} />
              <Route path="/anime" element={<AnimePage />} />
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
  );
}

export default App;