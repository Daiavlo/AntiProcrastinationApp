import { Link } from 'react-router-dom';
import './NotImplemented.css';

export function NotImplementedPage() {
  return (
    <div className="not-implemented-page page-transition">
      <div className="content-box">
        <h1 className="title">Module Not Available</h1>
        <p className="subtitle">
          This section of the Kinetic Void is currently under construction.
        </p>
        <div className="action-row">
          <Link to="/" className="btn btn-primary">Return to Base</Link>
        </div>
      </div>
    </div>
  );
}
