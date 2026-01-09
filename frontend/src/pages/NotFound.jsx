import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-background">
        <div className="dots-pattern"></div>
      </div>
      <div className="not-found-content">
        <div className="not-found-container">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          <p className="not-found-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-actions">
            <button
              onClick={() => navigate(-1)}
              className="not-found-button secondary"
            >
              Go Back
            </button>
            <Link to="/" className="not-found-button primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

