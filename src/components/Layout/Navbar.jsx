import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { FaTasks, FaCloudSunRain, FaCoins, FaFutbol, FaTv, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AppNavbar() {
  return (
    <Navbar 
      bg="light" 
      variant="light" 
      expand="lg" 
      collapseOnSelect 
      className="py-2 navbar-modern sticky-top"
      style={{
        boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Container>
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
        
        <Navbar.Toggle aria-controls="main-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Button 
              as={Link} 
              to="/anything" 
              variant="outline-primary"
              className="me-2 my-2 my-lg-0 d-none d-lg-block" 
              size="sm"
            >
              Dashboard
            </Button>
            
            <NavDropdown 
              title={<><FaTasks className="me-1" /> Todo</>} 
              id="todo-dropdown"
              className="nav-item-hover"
            >
              <NavDropdown.Item as={Link} to="/todo" className="py-2">
                All Tasks
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/todo/new" className="py-2">
                New Task
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/todo/edit" className="py-2">
                Edit Task
              </NavDropdown.Item>
            </NavDropdown>
            
            <Nav.Link as={Link} to="/weather" className="mx-1 nav-link-hover">
              <FaCloudSunRain className="me-1" /> Weather
            </Nav.Link>
            
            <Nav.Link as={Link} to="/crypto" className="mx-1 nav-link-hover">
              <FaCoins className="me-1" /> Crypto
            </Nav.Link>
            
            <Nav.Link as={Link} to="/football" className="mx-1 nav-link-hover">
              <FaFutbol className="me-1" /> Football
            </Nav.Link>
            
            <Nav.Link as={Link} to="/anime" className="mx-1 nav-link-hover">
              <FaTv className="me-1" /> Anime
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
