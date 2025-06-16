import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Admin/AdminNavbar';


function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('');

  const [loading, setLoading] = useState(false);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
    status: 'Pending',
  });

  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      alert('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      alert('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setFilteredTasks(tasks.filter(task => task.title.toLowerCase().includes(query)));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userFilter.toLowerCase())
  );

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      assignedTo: '',
      status: 'Pending',
    });
    setShowAddEditModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status || 'Pending',
    });
    setShowAddEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask
      ? `${process.env.REACT_APP_API_URL}/tasks/${editingTask._id}`
      : `${process.env.REACT_APP_API_URL}/tasks`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Task submission failed');
      } else {
        await fetchTasks();
        setShowAddEditModal(false);
      }
    } catch (err) {
      alert('Server error');
    }

    setLoading(false);
  };

  const openDeleteConfirm = (id) => {
    setDeleteTaskId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/tasks/${deleteTaskId}`, {
        method: 'DELETE',
      });
      await fetchTasks();
      setShowConfirm(false);
    } catch (err) {
      alert('Failed to delete task');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <><AdminNavbar />
    <div className="container mt-4">
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup style={{ maxWidth: '300px' }}>
          <FormControl placeholder="Search by title" onChange={handleSearch} />
        </InputGroup>
        <Button variant="primary" onClick={openAddModal}>Add New Task</Button>
      </div>

      {loading && <Spinner animation="border" className="mb-2" />}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Deadline</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th style={{ minWidth: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No tasks found</td></tr>
          ) : (
            filteredTasks.map(task => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : ''}</td>
                <td>{task.assignedTo?.name || 'Unassigned'}</td>
                <td>{task.status}</td>
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(task)}>Update</Button>
                  <Button size="sm" variant="danger" onClick={() => openDeleteConfirm(task._id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? 'Update Task' : 'Add Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assign To</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search user"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
              <Form.Select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
                <option value="">Select user</option>
                {filteredUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Show status only when editing */}
            {editingTask && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </Form.Select>
              </Form.Group>
            )}

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : (editingTask ? 'Update' : 'Add')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </>
  );
}

export default AdminTasks;
