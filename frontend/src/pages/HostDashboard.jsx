import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function HostDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [sheetUrl, setSheetUrl] = useState(null);
  const [lines, setLines] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dash, productLines, resps] = await Promise.all([
        api.hostDashboard(),
        api.hostProductLines(),
        api.hostResponses(),
      ]);
      setStats(dash.stats);
      setSheetUrl(dash.sheetUrl);
      setLines(productLines);
      setResponses(resps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openLineEditor = (line) => {
    setSelectedLine(line);
    setEditedQuestions(line.questions.map((q) => ({ ...q })));
    setTab('questions');
  };

  const updateQuestionText = (index, text) => {
    setEditedQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const saveQuestions = async () => {
    setError('');
    setMessage('');
    try {
      await api.updateQuestions(selectedLine.lineId, editedQuestions);
      setMessage('Questions updated successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const exportSheets = async () => {
    setError('');
    setMessage('');
    try {
      const data = await api.exportSheets();
      setMessage(data.message);
      if (data.sheetUrl) setSheetUrl(data.sheetUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadCsv = async () => {
    setError('');
    try {
      await api.downloadCsv();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">Host Dashboard</h2>
      <p className="section-subtitle">Modify pre-loaded questions and export employee survey data</p>

      {error && <div className="error-msg">{error}</div>}
      {message && <div className="success-msg">{message}</div>}

      <div className="tabs">
        {['overview', 'questions', 'responses'].map((t) => (
          <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="number">{stats.productCount}</div>
              <div className="label">Products</div>
            </div>
            <div className="stat-card">
              <div className="number">{stats.lineCount}</div>
              <div className="label">Product Lines</div>
            </div>
            <div className="stat-card">
              <div className="number">{stats.responseCount}</div>
              <div className="label">Survey Responses</div>
            </div>
            <div className="stat-card">
              <div className="number">{stats.employeeCount}</div>
              <div className="label">Employees</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Export Responses</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Responses are stored in MongoDB. Export to Google Sheets (if configured) or download
              CSV to import into Google Sheets manually.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary" onClick={exportSheets}>
                Sync to Google Sheets
              </button>
              <button type="button" className="btn btn-outline" onClick={downloadCsv}>
                Download CSV
              </button>
              {sheetUrl && (
                <a href={sheetUrl} target="_blank" rel="noreferrer" className="btn btn-gold">
                  Open Google Sheet
                </a>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Product Lines (click to edit questions)</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Category</th>
                    <th>Questions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.lineId}>
                      <td>{line.name}</td>
                      <td>{line.category}</td>
                      <td>{line.questions.filter((q) => q.isActive).length}</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => openLineEditor(line)}>
                          Edit Questions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'questions' && (
        <div className="card">
          {!selectedLine ? (
            <p>Select a product line from Overview to edit its shared questions.</p>
          ) : (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {selectedLine.name} — {selectedLine.category}
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                {selectedLine.description}. All variants in this line use these questions.
              </p>
              {editedQuestions.map((q, i) => (
                <div key={q._id || i} className="question-editor">
                  <label>Question {i + 1} ({q.type})</label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestionText(i, e.target.value)}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>
                    Options: {q.options?.join(', ')}
                  </small>
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={saveQuestions}>
                Save Questions
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'responses' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Category</th>
                  <th>Answers</th>
                </tr>
              </thead>
              <tbody>
                {responses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No responses yet
                    </td>
                  </tr>
                ) : (
                  responses.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.employeeName} ({r.employeeId})
                      </td>
                      <td>{r.productName}</td>
                      <td>{r.productVariant}</td>
                      <td>{r.category}</td>
                      <td>{r.answers.length} answers</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
