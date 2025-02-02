import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaTasks, FaCloudSunRain, FaCoins, FaFutbol, FaTv } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/anything">Anything Dash</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <NavDropdown 
              title={<><FaTasks className="me-1" /> Todo</>} 
              id="todo-dropdown"
            >
              <NavDropdown.Item as={Link} to="/todo">
                All Tasks
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/todo/new">New Task</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/todo/edit">Edit Task</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/weather">
              <FaCloudSunRain className="me-1" /> Weather
            </Nav.Link>
            <Nav.Link as={Link} to="/crypto">
              <FaCoins className="me-1" /> Crypto
            </Nav.Link>
            <Nav.Link as={Link} to="/football">
              <FaFutbol className="me-1" /> Football
            </Nav.Link>
            <Nav.Link as={Link} to="/anime">
              <FaTv className="me-1" /> Anime
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
