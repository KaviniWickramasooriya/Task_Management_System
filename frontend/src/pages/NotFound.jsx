import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">Page Not Found</h2>
      <p className="mb-4 text-muted fs-5">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
