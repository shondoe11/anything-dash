import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaTasks, FaCloudSunRain, FaCoins, FaFutbol, FaTv, FaHome, FaSun, FaMoon } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

export default function AppNavbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <Navbar 
      bg={darkMode ? "dark" : "light"} 
      variant={darkMode ? "dark" : "light"} 
      expand="lg" 
      collapseOnSelect 
      className="py-2 navbar-modern sticky-top"
    >
      <Container>
        <div className="d-flex align-items-center">
          <Navbar.Brand 
            as={Link} 
            to="/" 
            className="fw-bold text-uppercase fs-4 d-flex align-items-center" 
            style={{transition: 'all 0.3s ease-in-out'}}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#4361ee'; 
              e.currentTarget.style.textShadow = '0 0 10px rgba(67, 97, 238, 0.4)'; 
              e.currentTarget.style.transform = 'scale(1.05)';
            }} 
            onMouseOut={(e) => {
              e.currentTarget.style.color = ''; 
              e.currentTarget.style.textShadow = ''; 
              e.currentTarget.style.transform = '';
            }}
          >
            <span className="me-2 bg-primary text-white p-2 rounded-circle d-inline-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}}>
              <FaHome />
            </span>
            Anything Dash
          </Navbar.Brand>
          
          <Button
            variant={darkMode ? "outline-light" : "outline-dark"}
            className="d-flex align-items-center justify-content-center ms-2 theme-toggle"
            size="sm"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
            style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '50%',
              color: darkMode ? "#ffffff" : "#212529",
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,0,0.2)' : 'rgba(0,0,0,0.2)';
              e.currentTarget.style.color = darkMode ? '#ffdd00' : '#212529';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.color = darkMode ? '#ffffff' : '#212529';
            }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </Button>
          
          <Button
            as={Link}
            to="/anything"
            className="fw-bold shadow-sm mx-2 fs-6 dashboard-btn d-flex align-items-center justify-content-center"
            style={{ padding: '0.4rem 0.8rem' }}
            variant="primary"
          >
            <FaHome className="me-2" /> Dashboard
          </Button>
        </div>
        
        <Navbar.Toggle aria-controls="main-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto text-center">
            <div className="custom-nav-item">
              <Nav.Link className="d-flex align-items-center justify-content-center mx-1 dropdown-toggle"
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
                <Link to="/todo" className="custom-dropdown-item">All Tasks</Link>
                <Link to="/todo/new" className="custom-dropdown-item">New Task</Link>
                <Link to="/todo/edit" className="custom-dropdown-item">Edit Task</Link>
              </div>
            </div>
            
            <Nav.Link as={Link} to="/weather" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center">
              <FaCloudSunRain className="me-2" /> <span>Weather</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/crypto" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center">
              <FaCoins className="me-2" /> <span>Crypto</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/football" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center">
              <FaFutbol className="me-2" /> <span>Football</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/anime" className="mx-1 nav-link-hover d-flex align-items-center justify-content-center">
              <FaTv className="me-2" /> <span>Anime</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
