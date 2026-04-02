import { Link } from 'react-router-dom';
import './Login.css';

export function LoginPage() {
  return (
    <div className="login-page page-transition">
      <div className="login-container">
        
        <div className="login-box">
          <div className="login-header">
            <h1>The Void Awaits.</h1>
            <p className="subtitle">Enter your credentials to regain focus.</p>
          </div>

          <form className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input type="email" id="email" placeholder="student@university.edu" autoFocus />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="••••••••" />
            </div>
            
            <div className="login-options">
              <Link to="/forgot" className="forgot-link">Lost your way?</Link>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Enter the Void
            </button>
          </form>

          <div className="login-footer">
             <span className="text-muted">Don't have an account? </span>
             <Link to="/signup" className="text-dark">Apply for Access</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
