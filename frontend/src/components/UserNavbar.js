import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function UserNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); // Redirect to login
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold text-primary">
          User Dashboard
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar" />

        <Navbar.Collapse id="user-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/tasks">
              My Tasks
            </Nav.Link>
            <Nav.Link as={NavLink} to="/userProfile">
              My Profile
            </Nav.Link>
          </Nav>

          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default UserNavbar;
