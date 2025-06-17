import React, { useEffect, useState, useCallback } from 'react';
import UserNavbar from '../../components/Intern/UserNavbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Pagination } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

const TASKS_PER_PAGE = 5;

function Tasks() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

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

      const now = new Date();
      const upcoming = [];
      const past = [];

      data.forEach(task => {
        const deadline = task.deadline ? new Date(task.deadline) : null;
        if (!deadline || deadline >= now) {
          upcoming.push(task);
        } else {
          past.push(task);
        }
      });

      const sortByDeadline = (a, b) => {
        const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
        const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
        return dateA - dateB;
      };

      setTasks({
        upcoming: upcoming.sort(sortByDeadline),
        past: past.sort(sortByDeadline),
      });
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
      fetchTasks(); // refresh tasks
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

  const generatePDF = (title, tasksList, fileName) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, pageWidth / 2, 22, { align: 'center' });

    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    doc.setFontSize(11);
    doc.text(`Date: ${today}`, pageWidth / 2, 30, { align: 'center' });

    const tableColumn = ["Title", "Description", "Status", "Deadline"];
    const tableRows = tasksList.map(task => [
      task.title,
      task.description,
      task.status.replace('-', ' ').toUpperCase(),
      task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : 'N/A',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [99, 121, 171] },
    });

    doc.save(fileName);
  };

  const renderPagination = (totalTasks, currentPage, setPage) => {
    const totalPages = Math.ceil(totalTasks / TASKS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-3 justify-content-center">
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index}
            active={index + 1 === currentPage}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  const renderTable = (title, tasksList, pdfName, currentPage, setPage, isUpcoming) => {
    const startIdx = (currentPage - 1) * TASKS_PER_PAGE;
    const currentTasks = tasksList.slice(startIdx, startIdx + TASKS_PER_PAGE);

    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{title}</h4>
          {tasksList.length > 0 && (
            <Button variant="success" onClick={() => generatePDF(title, tasksList, pdfName)}>
              <FaDownload /> Download PDF
            </Button>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle" style={{ border: '1px solid #dee2e6' }}>
            <thead className="table-light">
              <tr>
                <th style={{ border: '1px solid #dee2e6' }}>Title</th>
                <th style={{ border: '1px solid #dee2e6' }}>Description</th>
                <th style={{ border: '1px solid #dee2e6' }}>Deadline</th>
                <th style={{ border: '1px solid #dee2e6' }}>Status</th>
                {isUpcoming && <th style={{ border: '1px solid #dee2e6' }}>Change Status</th>}
              </tr>
            </thead>
            <tbody>
              {currentTasks.map(task => (
                <tr key={task._id}>
                  <td className="fw-semibold">{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td>
                    <span className={getStatusBadge(task.status)}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  {isUpcoming && (
                    <td style={{ minWidth: '140px' }}>
                      <select
                        value={task.status}
                        onChange={e => updateStatus(task._id, e.target.value)}
                        className="form-select form-select-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {currentTasks.length === 0 && (
            <p className="text-center text-muted fst-italic">No tasks found</p>
          )}
          {renderPagination(tasksList.length, currentPage, setPage)}
        </div>
      </div>
    );
  };

  return (
    <>
      <UserNavbar />
      <div className="container my-5" style={{ maxWidth: '1100px' }}>
        <div className="card shadow-sm p-4">
          <h2 className="text-center mb-4">My Tasks</h2>

          {loading && <p className="text-center fs-5 text-primary">Loading tasks...</p>}
          {error && <p className="text-center fs-5 text-danger fw-semibold">{error}</p>}

          {!loading && !error && (
            <>
              {renderTable("🕒 Upcoming Tasks", tasks.upcoming, "Upcoming_Tasks.pdf", upcomingPage, setUpcomingPage, true)}
              {renderTable("❌ Past Deadline Tasks", tasks.past, "Past_Tasks.pdf", pastPage, setPastPage, false)}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Tasks;