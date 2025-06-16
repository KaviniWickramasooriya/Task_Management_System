import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand onClick={() => navigate('/adminDashboard')} style={{ cursor: 'pointer' }}>
          Admin Panel
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/adminDashboard')}>Dashboard</Nav.Link>
            <Nav.Link onClick={() => navigate('/admintasks')}>Tasks</Nav.Link>
            <Nav.Link onClick={() => navigate('/admin/users')}>Users</Nav.Link>
          </Nav>

          <Nav>
            <NavDropdown title="Account" id="admin-nav-dropdown" align="end">
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AdminNavbar;
