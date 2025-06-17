import React, { useEffect, useState, useCallback } from 'react';
import UserNavbar from '../../components/Intern/UserNavbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

function Tasks() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        setError('Invalid user data');
      }
    }
  }, []);

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

      // Sort by nearest deadline first
      const sorted = [...data].sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000); // Max date
        const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
        return dateA - dateB;
      });

      setTasks(sorted);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId, fetchTasks]);

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
        [...prevTasks.map(task => (task._id === taskId ? updatedTask : task))].sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
          return dateA - dateB;
        })
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

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    const title = 'My Tasks';
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleX = pageWidth / 2;
    doc.text(title, titleX, 22, { align: 'center' });

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.setFontSize(11);
    doc.text(`Date: ${formattedDate}`, titleX, 30, { align: 'center' });

    const tableColumn = ["Title", "Description", "Status", "Deadline"];
    const tableRows = [];

    tasks.forEach(task => {
      const rowData = [
        task.title,
        task.description,
        task.status.replace('-', ' ').toUpperCase(),
        task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : 'N/A'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [99, 121, 171] }, // Light blue header
    });

    doc.save('My_Tasks.pdf');
  };

  return (
    <>
      <UserNavbar />
      <div className="container my-5" style={{ maxWidth: '1100px' }}>
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-center w-100">My Tasks</h2>
            {tasks.length > 0 && (
              <Button
                variant="success"
                className="me-2"
                style={{ width: '180px' }}
                onClick={downloadPDF}
              >
                <FaDownload /> Download
              </Button>
            )}
          </div>

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
<table
                className="table table-hover table-striped align-middle"
                style={{ border: '1px solid #dee2e6', borderCollapse: 'collapse' }}
              >
                <thead
                  className="table-light"
                  style={{ borderBottom: '2px solid #dee2e6' }}
                >
                  <tr>
                    <th style={{ border: '1px solid #dee2e6' }}>Title</th>
                    <th style={{ border: '1px solid #dee2e6' }}>Description</th>
                    <th style={{ border: '1px solid #dee2e6' }}>Deadline</th>
                    <th style={{ border: '1px solid #dee2e6' }}>Status</th>
                    <th style={{ border: '1px solid #dee2e6' }}>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id}>
                      <td className="fw-semibold">{task.title}</td>
                      <td>{task.description}</td>
                      <td>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
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