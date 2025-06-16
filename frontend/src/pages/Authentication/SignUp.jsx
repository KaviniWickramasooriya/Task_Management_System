import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset OTP & verification if email changes
    if (e.target.name === 'email') {
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
      setMessage('');
    }
  };

  // Send OTP to email
  const sendOtp = async () => {
    if (!formData.email) {
      setMessage('Please enter your email');
      return;
    }
    setLoadingSendOtp(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpSent(false);
      }
    } catch (error) {
      setMessage('Failed to send OTP. Try again.');
      setOtpSent(false);
    }
    setLoadingSendOtp(false);
  };

  // Verify entered OTP
  const verifyOtp = async () => {
    if (!otp) {
      setMessage('Please enter OTP');
      return;
    }
    setLoadingVerifyOtp(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setOtpVerified(true);
      } else {
        setOtpVerified(false);
      }
    } catch (error) {
      setMessage('Failed to verify OTP. Try again.');
      setOtpVerified(false);
    }
    setLoadingVerifyOtp(false);
  };

  // Signup user after OTP verified
  const signup = async () => {
    if (!formData.name || !formData.password) {
      setMessage('Please fill all fields');
      return;
    }
    if (!otpVerified) {
      setMessage('Please verify OTP before signing up');
      return;
    }
    setLoadingSignUp(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        // Reset form on success
        setFormData({ name: '', email: '', password: '' });
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
      }
      navigate('/');
    } catch (error) {
      setMessage('Signup failed. Try again.');
    }
    setLoadingSignUp(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="shadow p-4 rounded bg-white" style={{ width: '100%', maxWidth: '400px' }}>
      <h3 className="text-center mb-4 text-primary">Create Account</h3>

      {/* Message */}
      {message && <div className="alert alert-info">{message}</div>}

      {/* Name */}
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          required
        />
      </div>

      {/* Email + Send OTP */}
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email address</label>
        <div className="input-group">
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            required
            disabled={otpSent} // disable email input after OTP sent
          />
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={sendOtp}
            disabled={loadingSendOtp || otpSent || !formData.email}
          >
            {loadingSendOtp ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
          </button>
        </div>
      </div>

      {/* OTP Input + Verify */}
      {otpSent && !otpVerified && (
        <div className="mb-3">
          <label htmlFor="otp" className="form-label">Enter OTP</label>
          <div className="input-group">
            <input
              id="otp"
              type="text"
              className="form-control"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
            />
            <button
              className="btn btn-outline-success"
              type="button"
              onClick={verifyOtp}
              disabled={loadingVerifyOtp || otp.length !== 6}
            >
              {loadingVerifyOtp ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {/* Password */}
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter secure password"
          required
          disabled={!otpVerified} // password only enabled after OTP verified
        />
      </div>

      {/* Sign Up Button */}
      <button
        className="btn btn-primary w-100"
        onClick={signup}
        disabled={loadingSignUp || !otpVerified || !formData.name || !formData.password}
      >
        {loadingSignUp ? 'Signing up...' : 'Sign Up'}
      </button>

        <div className="text-center mt-3">
          <small>
            Do you have an account? <a href="/">Login</a>
          </small>
        </div>
    </div>
    </div>
  );
}

export default SignUp;
