// SAME IMPORTS
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  FormControl,
  Spinner,
  Pagination,
} from 'react-bootstrap';
import AdminNavbar from '../../components/Admin/AdminNavbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaPlus, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';

function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
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
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 5;
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks`);
      const data = await res.json();

      const now = new Date();

      const filtered = data.filter((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const upcoming = filtered
        .filter((t) => !t.deadline || new Date(t.deadline) >= now);

      const past = filtered
        .filter((t) => t.deadline && new Date(t.deadline) < now);

      setTasks(data);
      setUpcomingTasks(groupAndSortByUser(upcoming));
      setPastTasks(groupAndSortByUser(past));
    } catch (error) {
      alert('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const groupAndSortByUser = (tasks) => {
    const grouped = {};

    tasks.forEach((task) => {
      const key = task.assignedTo?.name || 'Unassigned';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });

    const sortedGroupArray = Object.entries(grouped).map(([user, taskList]) => ({
      user,
      tasks: taskList.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
    }));

    return sortedGroupArray;
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
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    fetchTasks(); // Refetch on search query update
  }, [searchQuery]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(userFilter.toLowerCase())
  );

  const paginate = (items, currentPage) =>
    items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderGroupedTable = (groupedData, currentPage, setPage, allowEdit = true) => (
    <>
      {paginate(groupedData, currentPage).map((group, idx) => (
        <React.Fragment key={idx}>
          <tr className="table-primary">
            <td colSpan="6"><strong>{group.user}</strong></td>
          </tr>
          {group.tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : ''}</td>
              <td>{task.assignedTo?.name || 'Unassigned'}</td>
              <td>{task.status}</td>
              <td className="text-center">
                {allowEdit && (
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => openEditModal(task)}
                  >
                    <FaEdit />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => openDeleteConfirm(task._id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </React.Fragment>
      ))}
      {renderPagination(groupedData.length, currentPage, setPage)}
    </>
  );

  const renderPagination = (total, currentPage, onPageChange) => {
    const pages = Math.ceil(total / itemsPerPage);
    return (
      <Pagination className="justify-content-center">
        {[...Array(pages)].map((_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  const downloadPDF = (groupedList, title, filename) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const center = (pageWidth - textWidth) / 2;
    doc.text(title, center, 15);

    groupedList.forEach((group) => {
      autoTable(doc, {
        startY: doc.lastAutoTable?.finalY || 20,
        head: [[`Assigned To: ${group.user}`]],
        body: [],
      });

      autoTable(doc, {
        startY: doc.lastAutoTable?.finalY || 30,
        head: [['Title', 'Description', 'Deadline', 'Status']],
        body: group.tasks.map((task) => [
          task.title,
          task.description,
          task.deadline ? new Date(task.deadline).toLocaleDateString() : '',
          task.status,
        ]),
      });
    });

    doc.save(filename);
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup style={{ maxWidth: '300px' }}>
            <FormControl
              placeholder="Search by title"
              onChange={handleSearch}
              value={searchQuery}
            />
          </InputGroup>
          <div>
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => downloadPDF(upcomingTasks, 'Upcoming/Ongoing Tasks Report', 'upcoming_tasks.pdf')}
            >
              <FaFilePdf className="me-1" /> Download Upcoming Tasks
            </Button>
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => downloadPDF(pastTasks, 'Past Deadline Tasks Report', 'past_tasks.pdf')}
            >
              <FaFilePdf className="me-1" /> Download Past Tasks
            </Button>
            <Button variant="success" onClick={openAddModal}>
              <FaPlus className="me-1" /> Add New Task
            </Button>
          </div>
        </div>

        {loading && <Spinner animation="border" className="mb-3" />}

        {/* Upcoming Tasks Table */}
        <h5 className="mb-3">Upcoming/Ongoing Tasks</h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Deadline</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th className="text-center" style={{ minWidth: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>{renderGroupedTable(upcomingTasks, upcomingPage, setUpcomingPage, true)}</tbody>
        </Table>

        {/* Past Tasks Table */}
        <h5 className="mb-3">Past Deadline Tasks</h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Deadline</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th className="text-center" style={{ minWidth: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>{renderGroupedTable(pastTasks, pastPage, setPastPage, false)}</tbody>
        </Table>

        {/* Modals */}
        <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingTask ? 'Update Task' : 'Add Task'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Deadline</Form.Label>
                <Form.Control
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assign To</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search user"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
                <Form.Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select user</option>
                  {filteredUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {editingTask && (
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </Form.Select>
                </Form.Group>
              )}

              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : editingTask ? 'Update' : 'Add'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
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