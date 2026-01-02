import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signup, resendVerificationEmail } from '../../utils/api/auth';
import { useNotificationContext } from '../../App';
import { extractErrorMessage, extractErrorField } from '../../utils/errorHandler';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useNotificationContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

    if (!formData.email || !formData.email.trim()) {
      setErrors({ email: 'Email address is required' });
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.fullName);
      showSuccess('Account created successfully! Redirecting to login...', 1500);
      const from = location.state?.from?.pathname || '/simulate';
      setTimeout(() => navigate('/login', { state: { from: { pathname: from } } }), 1500);
    } catch (err) {
      const message = extractErrorMessage(err);
      const field = extractErrorField(err);
      
      if (field) {
        setErrors({ [field]: message });
      } else {
        showError(message);
        setErrors({});
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-8">
          <h1 className="text-[#00FF6F] text-3xl font-bold mb-2 text-center">Create Account</h1>
          <p className="text-gray-400 text-center mb-8">Sign up to save your simulations</p>

          {showVerificationMessage ? (
            <div className="text-center space-y-4">
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
                <div className="text-green-400 text-4xl mb-4">✓</div>
                <h2 className="text-green-400 text-xl font-bold mb-2">Check Your Email</h2>
                <p className="text-gray-300 mb-4">
                  We've sent a verification link to <strong className="text-white">{userEmail}</strong>
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await resendVerificationEmail(userEmail);
                      showSuccess('Verification email resent!', 2000);
                    } catch (err) {
                      showError(extractErrorMessage(err));
                    }
                  }}
                  className="text-[#00FF6F] hover:text-[#01D6DF] text-sm font-semibold transition-colors"
                >
                  Resend Verification Email
                </button>
              </div>
              <Link
                to="/login"
                className="inline-block text-gray-400 hover:text-[#00FF6F] text-sm transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-gray-300 text-sm font-semibold mb-2">
                Full Name (Optional)
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-[rgba(10,13,11,0.6)] border border-[rgba(0,255,111,0.2)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF6F] focus:ring-1 focus:ring-[#00FF6F] transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-[rgba(10,13,11,0.6)] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[rgba(0,255,111,0.2)] focus:border-[#00FF6F] focus:ring-[#00FF6F]'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className={`w-full bg-[rgba(10,13,11,0.6)] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[rgba(0,255,111,0.2)] focus:border-[#00FF6F] focus:ring-[#00FF6F]'
                }`}
                placeholder="Minimum 8 characters"
              />
              {errors.password && (
                <p className="mt-1 text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-semibold mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className={`w-full bg-[rgba(10,13,11,0.6)] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[rgba(0,255,111,0.2)] focus:border-[#00FF6F] focus:ring-[#00FF6F]'
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          )}

          {!showVerificationMessage && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00FF6F] hover:text-[#01D6DF] font-semibold transition-colors">
                Log In
              </Link>
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

