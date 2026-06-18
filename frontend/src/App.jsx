import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import EmployeeLogin from './pages/EmployeeLogin';
import HostLogin from './pages/HostLogin';
import SurveyPage from './pages/SurveyPage';
import HostDashboard from './pages/HostDashboard';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token || userRole !== role) {
    return <Navigate to={role === 'host' ? '/host' : '/login'} replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    if (stored && role) {
      setUser({ ...JSON.parse(stored), role });
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<EmployeeLogin onLogin={handleLogin} />} />
        <Route path="/host" element={<HostLogin onLogin={handleLogin} />} />
        <Route
          path="/survey"
          element={
            <ProtectedRoute role="employee">
              <SurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute role="host">
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
