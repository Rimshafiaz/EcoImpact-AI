import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../utils/api/auth';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/simulate');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-8">
          <h1 className="text-[#00FF6F] text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">Log in to access your simulations</p>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[rgba(10,13,11,0.6)] border border-[rgba(0,255,111,0.2)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF6F] focus:ring-1 focus:ring-[#00FF6F] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[rgba(10,13,11,0.6)] border border-[rgba(0,255,111,0.2)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF6F] focus:ring-1 focus:ring-[#00FF6F] transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#00FF6F] hover:text-[#01D6DF] font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

