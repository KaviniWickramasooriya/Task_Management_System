import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Admin/AdminNavbar';


function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/tasks`),
          fetch(`${process.env.REACT_APP_API_URL}/users`),
        ]);

        const tasks = await tasksRes.json();
        const users = await usersRes.json();

        const pending = tasks.filter(task => task.status === 'Pending').length;
        const inProgress = tasks.filter(task => task.status === 'In Progress').length;
        const completed = tasks.filter(task => task.status === 'Completed').length;

        setStats({
          totalTasks: tasks.length,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed,
          totalUsers: users.length,
        });
      } catch (err) {
        alert('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardData = [
    { title: 'Total Tasks', value: stats.totalTasks, bg: 'primary' },
    { title: 'Pending Tasks', value: stats.pendingTasks, bg: 'warning' },
    { title: 'In Progress Tasks', value: stats.inProgressTasks, bg: 'info' },
    { title: 'Completed Tasks', value: stats.completedTasks, bg: 'success' },
    { title: 'Total Users', value: stats.totalUsers, bg: 'dark' },
  ];

  return (
    <>
    <AdminNavbar />
    <div className="container mt-4">
      
      <h3 className="mb-4 text-center">Admin Dashboard</h3>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {cardData.map((item, idx) => (
            <Col key={idx}>
              <Card bg={item.bg} text="white" className="shadow-sm">
                <Card.Body>
                  <Card.Title className="text-center">{item.title}</Card.Title>
                  <Card.Text className="display-6 text-center">{item.value}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
    </>
  );
}

export default AdminDashboard;
