import { Link } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        <span className="logo-mark">🌿</span>
        Aarong
      </Link>
      <nav className="nav-links">
        {user ? (
          <>
            <span style={{ opacity: 0.9 }}>Welcome, {user.name || user.username}</span>
            {user.role === 'employee' && <Link to="/survey">My Surveys</Link>}
            {user.role === 'host' && <Link to="/host/dashboard">Dashboard</Link>}
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Employee Login</Link>
            <Link to="/host">Host Login</Link>
          </>
        )}
      </nav>
    </header>
  );
}
