import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaTasks, FaCloudSunRain, FaCoins, FaFutbol, FaTv, FaHome, FaTachometerAlt, FaSun, FaMoon } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function AppNavbar() {
  const [expanded, setExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { netlifyUser, login, logout } = useAuth();
  const darkMode = theme === 'dark';
  
  return (
    <Navbar
      expanded={expanded}
      onToggle={setExpanded}
      bg={theme}
      variant={theme}
      expand="lg"
      collapseOnSelect
      className="py-2 navbar-modern sticky-top"
    >
      <Container>
        <div className="d-flex align-items-center">
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold text-uppercase fs-4 d-flex align-items-center navbar-brand-transition"
          >
            <span className="me-2 bg-primary text-white p-2 rounded-circle d-inline-flex justify-content-center align-items-center navbar-brand-icon" style={{width: '40px', height: '40px'}}>
              <FaHome />
            </span>
            Anything Dash
          </Navbar.Brand>
          
          <Button
            variant={darkMode ? "outline-light" : "outline-dark"}
            className={`d-flex align-items-center justify-content-center ms-2 theme-toggle ${theme}`}
            size="sm"
            onClick={toggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </Button>
          
          <Button
            as={Link}
            to="/anything"
            className="fw-bold shadow-sm mx-2 fs-6 dashboard-btn d-flex align-items-center justify-content-center"
            variant="primary"
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </Button>
        </div>
        
        <Navbar.Toggle aria-controls="main-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto text-center">
            <div className="custom-nav-item">
              <Nav.Link className="d-flex align-items-center justify-content-center mx-1 dropdown-toggle nav-link-hover"
                onClick={() => {
                  const menu = document.getElementById('custom-todo-dropdown');
                  if (menu) {
                    menu.classList.toggle('show');
                  }
                }}
              >
                <FaTasks className="me-2" /> <span>Todo</span>
              </Nav.Link>
              <div id="custom-todo-dropdown" className="custom-dropdown-menu">
                <Link
                  to="/todo"
                  className="custom-dropdown-item"
                  onClick={() => {
                    document.getElementById('custom-todo-dropdown')?.classList.remove('show');
                    setExpanded(false);
                  }}
                >All Tasks</Link>
                <Link
                  to="/todo/new"
                  className="custom-dropdown-item"
                  onClick={() => { document.getElementById('custom-todo-dropdown')?.classList.remove('show'); setExpanded(false); }}
                >New Task</Link>
              </div>
            </div>
            
            <Nav.Link as={Link} to="/weather" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center" onClick={() => setExpanded(false)}>
              <FaCloudSunRain className="me-2" /> <span>Weather</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/crypto" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center" onClick={() => setExpanded(false)}>
              <FaCoins className="me-2" /> <span>Crypto</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/football" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center" onClick={() => setExpanded(false)}>
              <FaFutbol className="me-2" /> <span>Football</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/anime" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center" onClick={() => setExpanded(false)}>
              <FaTv className="me-2" /> <span>Anime</span>
            </Nav.Link>
            
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={darkMode ? "outline-light" : "outline-dark"}
                onClick={() => { (netlifyUser ? logout() : login()); setExpanded(false); }}
                className="mx-2 nav-link-hover"
              >
                {netlifyUser ? 'Logout' : 'Login'}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
