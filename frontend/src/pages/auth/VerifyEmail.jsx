import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../utils/api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed. The link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0A0D0B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-8">
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#00FF6F] border-t-transparent mb-4"></div>
              <h1 className="text-[#00FF6F] text-2xl font-bold mb-2">Verifying Email...</h1>
              <p className="text-gray-400">Please wait while we verify your email address.</p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h1 className="text-[#00FF6F] text-3xl font-bold mb-2">Email Verified!</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)]"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-red-400 text-6xl mb-4">✗</div>
              <h1 className="text-red-400 text-3xl font-bold mb-2">Verification Failed</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="block px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)]"
                >
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="block text-gray-400 hover:text-[#00FF6F] text-sm transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

