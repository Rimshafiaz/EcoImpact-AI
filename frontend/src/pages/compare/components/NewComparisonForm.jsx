import { useState, useEffect } from 'react';
import { getAvailableCountries } from '../../../utils/api/predictions';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { useTheme } from '../../../contexts/ThemeContext';

export default function NewComparisonForm({ onCompare, onCancel, loading }) {
  const { showError } = useNotificationContext();
  const { theme } = useTheme();
  const [countries, setCountries] = useState([]);
  const isDark = theme === 'dark';
  const [form1, setForm1] = useState({
    country: '',
    policyType: 'Carbon Tax',
    carbonPrice: '',
    coverage: '',
    duration: 5
  });
  const [form2, setForm2] = useState({
    country: '',
    policyType: 'Carbon Tax',
    carbonPrice: '',
    coverage: '',
    duration: 5
  });

  useEffect(() => {
    getAvailableCountries().then(setCountries).catch(err => {
      showError(extractErrorMessage(err));
    });
  }, [showError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form1.country && form2.country) {
      onCompare(form1, form2);
    }
  };

  const updateForm = (formNum, field, value) => {
    if (formNum === 1) {
      setForm1(prev => ({ ...prev, [field]: value }));
    } else {
      setForm2(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: 'var(--primary-green)' }}>
          Compare New Policies
        </h1>
        <button
          onClick={onCancel}
          className="transition-colors"
          style={{ color: 'var(--primary-green)' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-green)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--primary-green)'}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            className="rounded-xl border p-6"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-green)' }}>Policy 1</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Country</label>
                <select
                  value={form1.country}
                  onChange={(e) => updateForm(1, 'country', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Policy Type</label>
                <select
                  value={form1.policyType}
                  onChange={(e) => updateForm(1, 'policyType', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                >
                  <option value="Carbon Tax">Carbon Tax</option>
                  <option value="ETS">ETS</option>
                </select>
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>
                  {form1.policyType === 'Carbon Tax' ? 'Tax Rate (USD/tonne)' : 'Carbon Price (USD/tonne)'}
                </label>
                <input
                  type="number"
                  value={form1.carbonPrice}
                  onChange={(e) => updateForm(1, 'carbonPrice', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Coverage (%)</label>
                <input
                  type="number"
                  value={form1.coverage}
                  onChange={(e) => updateForm(1, 'coverage', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                  min="10"
                  max="90"
                  step="1"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Duration (years)</label>
                <input
                  type="number"
                  value={form1.duration}
                  onChange={(e) => updateForm(1, 'duration', parseInt(e.target.value))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl border p-6"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: isDark ? '#34D399' : '#5C9B6F' }}>Policy 2</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Country</label>
                <select
                  value={form2.country}
                  onChange={(e) => updateForm(2, 'country', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Policy Type</label>
                <select
                  value={form2.policyType}
                  onChange={(e) => updateForm(2, 'policyType', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                >
                  <option value="Carbon Tax">Carbon Tax</option>
                  <option value="ETS">ETS</option>
                </select>
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>
                  {form2.policyType === 'Carbon Tax' ? 'Tax Rate (USD/tonne)' : 'Carbon Price (USD/tonne)'}
                </label>
                <input
                  type="number"
                  value={form2.carbonPrice}
                  onChange={(e) => updateForm(2, 'carbonPrice', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Coverage (%)</label>
                <input
                  type="number"
                  value={form2.coverage}
                  onChange={(e) => updateForm(2, 'coverage', e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  required
                  min="10"
                  max="90"
                  step="1"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--text-primary)' }}>Duration (years)</label>
                <input
                  type="number"
                  value={form2.duration}
                  onChange={(e) => updateForm(2, 'duration', parseInt(e.target.value))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 font-bold rounded-lg transition-opacity disabled:opacity-50"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(135deg, #2D7A4F 0%, #5C9B6F 100%)',
              color: isDark ? '#0A0D0B' : '#FFFFFF'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Comparing...' : 'Compare Policies'}
          </button>
        </div>
      </form>
    </div>
  );
}

