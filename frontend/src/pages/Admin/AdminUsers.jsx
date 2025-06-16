import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Table, InputGroup,
  FormControl, Spinner, Toast, Alert
} from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaUserSlash } from 'react-icons/fa6';
import AdminNavbar from '../../components/Admin/AdminNavbar';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', isActive: true });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      setError('Error fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  const filtered = users.filter(user =>
    user.role === 'intern' &&
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
     user.email.toLowerCase().includes(search.toLowerCase()))
  );
  setFiltered(filtered);
}, [search, users]);


  const handleUpdate = user => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, { method: 'DELETE' });
        fetchUsers();
        setToast({ show: true, message: 'User deleted successfully.', variant: 'danger' });
      } catch (err) {
        setError('Failed to delete user.');
      }
    }
  };

  const handleDeactivate = async id => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/users/deactivate/${id}`, {
          method: 'PUT',
        });
        fetchUsers();
        setToast({ show: true, message: 'User deactivated.', variant: 'warning' });
      } catch (err) {
        setError('Failed to deactivate user.');
      }
    }
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchUsers();
      setToast({ show: true, message: 'User updated successfully.', variant: 'success' });
    } catch (err) {
      setError('Update error.');
    }
    setLoading(false);
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>All Users</h4>
          <InputGroup style={{ maxWidth: '300px' }}>
            <FormControl
              placeholder="Search by name/email"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Table striped bordered hover responsive>
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user._id}>
                <td>{idx + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isActive ? 'Active' : 'Deactivated'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleUpdate(user)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="me-2"
                    onClick={() => handleDelete(user._id)}
                  >
                    <FaTrash />
                  </Button>
                  {user.isActive && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeactivate(user._id)}
                    >
                      <FaUserSlash />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.isActive ? 'active' : 'deactivated'}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.value === 'active' })
                }
              >
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Update'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast */}
      <Toast
        bg={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
        show={toast.show}
        delay={3000}
        autohide
        className="position-fixed bottom-0 end-0 m-4"
      >
        <Toast.Header>
          <strong className="me-auto">Admin</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{toast.message}</Toast.Body>
      </Toast>
    </>
  );
}

export default AdminUsers;
