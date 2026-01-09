import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-background">
            <div className="dots-pattern"></div>
          </div>
          <div className="error-boundary-content">
            <div className="error-boundary-container">
              <h1 className="error-boundary-title">Something Went Wrong</h1>
              <p className="error-boundary-description">
                We encountered an unexpected error. Please try refreshing the page or return to the home page.
              </p>
              <div className="error-boundary-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="error-boundary-button primary"
                >
                  Refresh Page
                </button>
                <Link to="/" className="error-boundary-button secondary">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

