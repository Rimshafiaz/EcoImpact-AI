import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../utils/api/auth';
import { useNotificationContext } from '../../App';
import { extractErrorMessage, extractErrorField } from '../../utils/errorHandler';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useNotificationContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const LeafSVG = ({ color = '#2D7A4F', size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32C8 32 12 20 20 12C28 4 36 2 36 2C36 2 34 10 26 18C18 26 8 32 8 32Z" fill={color} fillOpacity="0.6"/>
      <path d="M20 12C20 12 18 20 14 26C10 32 8 32 8 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" fillOpacity="0.8"/>
    </svg>
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      showSuccess('Login successful!', 1500);
      window.dispatchEvent(new Event('auth-change'));
      const from = location.state?.from?.pathname || '/simulate';
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      const message = extractErrorMessage(err);
      const field = extractErrorField(err);
      
      if (field) {
        setErrors({ [field]: message });
      } else {
        showError(message);
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="floating-leaf float-2">
        <LeafSVG color="#4A90A4" size={45} />
      </div>
      <div className="floating-leaf float-3">
        <LeafSVG color="#2D7A4F" size={40} />
      </div>
      <div className="floating-leaf across-3">
        <LeafSVG color="#5C9B6F" size={35} />
      </div>

      <div className="w-full max-w-md">
        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Log in to access your simulations</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={`login-input login-input-with-icon ${
                    errors.email || errors.username
                      ? 'login-input-error'
                      : ''
                  }`}
                  placeholder="email"
                />
              </div>
              {(errors.email || errors.username) && (
                <p className="login-error-text">{errors.email || errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={`login-input login-input-with-icon login-input-with-toggle ${
                    errors.password
                      ? 'login-input-error'
                      : ''
                  }`}
                  placeholder="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="login-error-text">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="login-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                  Logging In...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="login-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

