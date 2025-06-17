import React, { useState, useEffect } from 'react';
import { Spinner, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', success: false });

  useEffect(() => {
    // Load Google Identity Services SDK script
    const scriptId = 'google-oauth-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initializeGoogleSignIn;
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large', width: '100%' } // customization
      );
    }
  };

  const handleGoogleResponse = async response => {
    setLoading(true);
    try {
      // The ID token from Google
      const credential = response.credential;

      // Send the token to backend to verify and login/signup user
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToast({ show: true, message: data.message || 'Login successful', success: true });

        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/adminDashboard');
          } else if (data.user.role === 'intern') {
            navigate('/tasks');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setToast({ show: true, message: data.message || 'Google login failed', success: false });
      }
    } catch (err) {
      setToast({ show: true, message: 'Server error during Google login', success: false });
    }
    setLoading(false);
  };

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToast({ show: true, message: data.message, success: true });

        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/adminDashboard');
          } else if (data.user.role === 'intern') {
            navigate('/tasks');
          } else {
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

        <div className="my-3 text-center">
          <div id="googleSignInDiv"></div>
        </div>

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