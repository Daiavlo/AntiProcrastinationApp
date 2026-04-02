import { Outlet, Link } from 'react-router-dom';
import './Layout.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <Link to="/" className="brand">
            <span className="brand-text">VOID</span>
          </Link>
          
          <nav className="nav-links">
            <Link to="/mission" className="nav-link">Mission</Link>
            <Link to="/features" className="nav-link">Features</Link>
          </nav>

          <div className="header-actions">
            <Link to="/login" className="nav-link login-link">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      {/* Optional minimal footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="brand-sm">VOID <span className="text-muted">© 2024</span></div>
          <div className="footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
