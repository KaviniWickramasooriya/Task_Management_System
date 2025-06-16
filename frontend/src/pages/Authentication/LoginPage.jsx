import React, { useState } from 'react';
import { Spinner, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', success: false });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToast({ show: true, message: data.message, success: true });

        // Navigate based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/adminDashboard');
          } else if (data.user.role === 'intern') {
            navigate('/tasks');
          }
          else{
            navigate('/');
          }
        }, 1500);
      } else {
        setToast({ show: true, message: data.message || 'Login failed', success: false });
      }
    } catch (err) {
      setToast({ show: true, message: 'Server error', success: false });
    }

    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="shadow p-4 rounded bg-white" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4 text-primary">Welcome Back</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Don’t have an account? <a href="/signup">Sign Up</a>
          </small>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <Toast
            onClose={() => setToast({ ...toast, show: false })}
            show={toast.show}
            delay={3000}
            autohide
            bg={toast.success ? 'success' : 'danger'}
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
