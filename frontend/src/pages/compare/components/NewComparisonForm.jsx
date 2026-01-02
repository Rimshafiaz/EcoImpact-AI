import { useState, useEffect } from 'react';
import { getAvailableCountries } from '../../../utils/api/predictions';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';

export default function NewComparisonForm({ onCompare, onCancel, loading }) {
  const { showError } = useNotificationContext();
  const [countries, setCountries] = useState([]);
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
      console.error('Failed to load countries:', err);
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
        <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide">
          Compare New Policies
        </h1>
        <button
          onClick={onCancel}
          className="text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-6">
            <h2 className="text-2xl font-bold text-[#00FF6F] mb-6">Policy 1</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Country</label>
                <select
                  value={form1.country}
                  onChange={(e) => updateForm(1, 'country', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Policy Type</label>
                <select
                  value={form1.policyType}
                  onChange={(e) => updateForm(1, 'policyType', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                >
                  <option value="Carbon Tax">Carbon Tax</option>
                  <option value="ETS">ETS</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Carbon Price (USD/tonne)</label>
                <input
                  type="number"
                  value={form1.carbonPrice}
                  onChange={(e) => updateForm(1, 'carbonPrice', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Coverage (%)</label>
                <input
                  type="number"
                  value={form1.coverage}
                  onChange={(e) => updateForm(1, 'coverage', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                  min="10"
                  max="90"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Duration (years)</label>
                <input
                  type="number"
                  value={form1.duration}
                  onChange={(e) => updateForm(1, 'duration', parseInt(e.target.value))}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-6">
            <h2 className="text-2xl font-bold text-[#01D6DF] mb-6">Policy 2</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Country</label>
                <select
                  value={form2.country}
                  onChange={(e) => updateForm(2, 'country', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Policy Type</label>
                <select
                  value={form2.policyType}
                  onChange={(e) => updateForm(2, 'policyType', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                >
                  <option value="Carbon Tax">Carbon Tax</option>
                  <option value="ETS">ETS</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Carbon Price (USD/tonne)</label>
                <input
                  type="number"
                  value={form2.carbonPrice}
                  onChange={(e) => updateForm(2, 'carbonPrice', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Coverage (%)</label>
                <input
                  type="number"
                  value={form2.coverage}
                  onChange={(e) => updateForm(2, 'coverage', e.target.value)}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
                  required
                  min="10"
                  max="90"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Duration (years)</label>
                <input
                  type="number"
                  value={form2.duration}
                  onChange={(e) => updateForm(2, 'duration', parseInt(e.target.value))}
                  className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
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
            className="px-8 py-3 bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare Policies'}
          </button>
        </div>
      </form>
    </div>
  );
}

