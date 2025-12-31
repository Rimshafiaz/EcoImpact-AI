import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../index.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/simulate" className={`nav-link ${location.pathname === '/simulate' ? 'active' : ''}`}>Simulate</Link>
          <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>History</Link>
          <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>Compare</Link>
          <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Log In</Link>
          <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}
