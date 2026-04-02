import { Link } from 'react-router-dom';
import './Landing.css';

export function LandingPage() {
  return (
    <div className="landing-page page-transition">
      <div className="landing-container">
        
        <div className="landing-hero">
          <div className="hero-content">
            <span className="hero-eyebrow">EXECUTION IS EVERYTHING</span>
            <h1 className="hero-title">
              Master the<br/>
              <span className="text-red">Kinetic Void</span>
            </h1>
            <p className="hero-subtitle">
              The surgical anti-procrastination tool for elite students. 
              Eliminate noise and maintain breathless momentum on every assignment.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/features" className="btn btn-secondary btn-lg">Learn More</Link>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-image-placeholder">
              <div className="completion-card">
                <div className="card-value text-red">98%</div>
                <div className="card-label">COMPLETION RATE</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
