import React, { useEffect, useState, useCallback } from 'react';
import UserNavbar from '../../components/Intern/UserNavbar';

function Tasks() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get userId from localStorage 'user' object
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id); // your userId is stored as `id`
      } catch (err) {
        console.error('Failed to parse user data:', err);
        setError('Invalid user data');
      }
    }
  }, []);

  // Fetch tasks for the current user
  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, fetchTasks]);

  // Update task status
  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const updatedTask = await res.json();
      setTasks(prevTasks =>
        prevTasks.map(task => (task._id === taskId ? updatedTask : task))
      );
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'in-progress':
        return 'badge bg-info text-dark';
      case 'completed':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <>
      <UserNavbar />
      <div className="container my-5" style={{ maxWidth: '900px' }}>
        <div className="card shadow-sm p-4">
          <h2 className="mb-4 text-center">My Tasks</h2>

          {loading && (
            <p className="text-center fs-5 text-primary">Loading tasks...</p>
          )}

          {error && (
            <p className="text-center fs-5 text-danger fw-semibold">{error}</p>
          )}

          {!loading && !error && tasks.length === 0 && (
            <p className="text-center fs-5 text-muted fst-italic">
              No tasks found
            </p>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id}>
                      <td className="fw-semibold">{task.title}</td>
                      <td>{task.description}</td>
                      <td>
                        <span className={getStatusBadge(task.status)}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ minWidth: '140px' }}>
                        <select
                          value={task.status}
                          onChange={e => updateStatus(task._id, e.target.value)}
                          className="form-select form-select-sm"
                          aria-label={`Change status for ${task.title}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Tasks;