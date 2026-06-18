import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">A BRAC Social Enterprise</span>
          <h1>Employee Product Survey</h1>
          <p>
            Share your feedback on Aarong Earth and Aarong Dairy products. Your insights help us
            deliver ethically made, handcrafted quality to customers across Bangladesh.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-gold">
              Employee Login
            </Link>
            <Link to="/host" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
              Host Portal
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple steps for employees and survey hosts</p>

        <div className="card-grid">
          <div className="card">
            <h3>1. Login</h3>
            <p>Use your Employee ID and PIN provided by your supervisor to access the survey portal.</p>
          </div>
          <div className="card">
            <h3>2. Select Product</h3>
            <p>
              Choose an Aarong Earth or Dairy product variant. Questions are shared across flavours
              (e.g. Aloe Vera & Tulsi Face Wash use the same survey).
            </p>
          </div>
          <div className="card">
            <h3>3. Submit Feedback</h3>
            <p>
              Tick your answers and submit. Responses are saved and exported to a spreadsheet for
              the host team.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Product Categories</h3>
          <div className="card-grid">
            <div>
              <strong style={{ color: 'var(--green-mid)' }}>Aarong Earth</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Face washes, masks, bathing bars, body wash, hair packs, soothing gels, and more —
                inspired by{' '}
                <a href="https://www.aarong.com/bgd/brands/aarong-earth" target="_blank" rel="noreferrer">
                  aarong.com
                </a>
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--green-mid)' }}>Aarong Dairy</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Milk, yogurt, ghee, butter, cheese, and traditional sweets from Bangladesh&apos;s
                largest dairy brand.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="brand-footer">
        <p>
          <strong>Aarong</strong> — Ethically made handcrafted products | A BRAC social enterprise
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Demo: Employee <strong>EMP001</strong> / PIN <strong>1234</strong> · Host{' '}
          <strong>host</strong> / <strong>admin123</strong>
        </p>
      </footer>
    </>
  );
}
