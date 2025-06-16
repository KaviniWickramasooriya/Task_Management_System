import React, { useEffect, useState } from 'react';
import UserNavbar from '../../components/Intern/UserNavbar';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setError('User not found in local storage');
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/users/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user profile');
        const data = await res.json();
        setUserData(data);
        setError('');
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  if (loading) return <p className="text-center mt-5">Loading profile...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;
  if (!userData) return null;

  return (
    <>
      <UserNavbar />
      <div className="container my-5" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4 text-center border-bottom pb-2">My Profile</h2>
        <div className="card shadow-sm rounded-3 p-4 bg-light">
          <div className="d-flex align-items-center mb-4">
            <div className="me-3">
              {/* Bootstrap icon user-circle */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="#0d6efd"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M13.468 12.37C12.758 11.226 11.43 10.5 9.999 10.5c-1.43 0-2.76.726-3.47 1.87A6.978 6.978 0 0 1 2 8a6.978 6.978 0 0 1 4.53-6.37C7.24 3.27 8.57 4 9.999 4c1.43 0 2.758-.726 3.468-1.87A6.978 6.978 0 0 1 14 8a6.978 6.978 0 0 1-3.532 4.37zM8 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                <path fillRule="evenodd" d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z"/>
              </svg>
            </div>
            <div>
              <h4 className="mb-1">{userData.name}</h4>
              <small className="text-muted">{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</small>
            </div>
          </div>
          <div className="mb-3">
            <span className="fw-semibold text-secondary">Email:</span> <span>{userData.email}</span>
          </div>
          <div className="mb-3">
            <span className="fw-semibold text-secondary">Status:</span>{' '}
            <span
              className={`badge ${
                userData.isActive ? 'bg-success' : 'bg-danger'
              }`}
            >
              {userData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 mt-4"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
