import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Authentication/LoginPage';
import SignUp from './pages/Authentication/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import AdminTasks from './pages/Admin/AdminTasks';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import Tasks from './pages/Intern/Tasks';
import UserProfile from './pages/Intern/UserProfile';
import NotFound from './pages/NotFound';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />
      
      <Route
        path="/tasks"
        element={<ProtectedRoute><Tasks /></ProtectedRoute>}
      />
      <Route
        path="/admintasks"
        element={<ProtectedRoute><AdminTasks /></ProtectedRoute>}
      />
      <Route
        path="/adminDashboard"
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute><AdminUsers /></ProtectedRoute>}
      />
      <Route
        path="/userProfile"
        element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
      />
     
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;