import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { isAuthenticated, getCurrentUser, logout as authLogout } from '../utils/api/auth';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import '../index.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

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
          {isLoggedIn && (
            <>
              <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>History</Link>
              <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>Compare</Link>
            </>
          )}
          <Link to="/faqs" className={`nav-link ${location.pathname === '/faqs' ? 'active' : ''}`}>FAQs</Link>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Log In</Link>
              <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
                style={{
                  color: theme === 'dark' ? '#F1F5F9' : '#2C2416',
                  WebkitTextFillColor: theme === 'dark' ? '#F1F5F9' : '#2C2416',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'color 0.3s ease'
                }}
                key={`user-button-${theme}`}
              >
                <span style={{
                  color: theme === 'dark' ? '#F1F5F9' : '#2C2416',
                  WebkitTextFillColor: theme === 'dark' ? '#F1F5F9' : '#2C2416'
                }}>
                  {user?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    color: theme === 'dark' ? '#F1F5F9' : '#2C2416'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '12rem',
                    borderRadius: '0.5rem',
                    zIndex: 50,
                    backgroundColor: theme === 'dark' ? 'rgba(26, 38, 30, 0.98)' : 'rgb(255, 255, 255)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    boxShadow: theme === 'dark' ? '0 4px 16px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ padding: '0.5rem 0', backgroundColor: theme === 'dark' ? 'transparent' : 'rgb(255, 255, 255)' }}>
                    <div 
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        backgroundColor: theme === 'dark' ? 'transparent' : 'rgb(255, 255, 255)',
                        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)'}`
                      }}
                    >
                      <div 
                        style={{ 
                          fontWeight: 600,
                          color: theme === 'dark' ? '#10B981' : '#2D7A4F',
                          WebkitTextFillColor: theme === 'dark' ? '#10B981' : '#2D7A4F',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {user?.full_name || 'User'}
                      </div>
                      <div 
                        style={{ 
                          fontSize: '0.75rem',
                          color: theme === 'dark' ? '#94A3B8' : '#7D7163',
                          WebkitTextFillColor: theme === 'dark' ? '#94A3B8' : '#7D7163',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{ 
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#F1F5F9' : '#2C2416',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
                        e.target.style.color = theme === 'dark' ? '#10B981' : '#2D7A4F';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = theme === 'dark' ? '#F1F5F9' : '#2C2416';
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <ThemeSwitcher />
        </div>
      </div>
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
