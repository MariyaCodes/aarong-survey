import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function EmployeeLogin({ onLogin }) {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.employeeLogin({ employeeId, pin });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'employee');
      localStorage.setItem('user', JSON.stringify(data.employee));
      onLogin({ ...data.employee, role: 'employee' });
      navigate('/survey');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <h2>Employee Login</h2>
        <p className="subtitle">Enter your Employee ID and PIN to start the survey</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              placeholder="e.g. EMP001"
              value={employeeId}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Login & Start Survey'}
          </button>
        </form>
      </div>
    </div>
  );
}
