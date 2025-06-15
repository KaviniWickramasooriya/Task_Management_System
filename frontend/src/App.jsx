import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TaskListPage from './pages/TaskListPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/tasks"
        element={<ProtectedRoute><TaskListPage /></ProtectedRoute>}
      />
      <Route
        path="/users"
        element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default App;