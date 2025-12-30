import { useState, useEffect } from 'react';
import { getAvailableCountries } from '../../../utils/api/predictions';

export default function InputForm({ onSubmit, loading, hasResults }) {
  const [formData, setFormData] = useState({
    country: '',
    policyType: 'Carbon tax',
    carbonPrice: '',
    coverage: 40,
    duration: 5,
    year: 2025
  });

  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showPolicyTypeDropdown, setShowPolicyTypeDropdown] = useState(false);

  const durationOptions = [
    { value: 1, label: '1 Year' },
    { value: 3, label: '3 Years' },
    { value: 5, label: '5 Years' },
    { value: 10, label: '10 Years' },
    { value: 20, label: '20 Years' }
  ];

  const policyTypeOptions = [
    { value: 'Carbon tax', label: 'Carbon Tax' },
    { value: 'ETS', label: 'ETS (Emissions Trading System)' }
  ];

  useEffect(() => {
    getAvailableCountries()
      .then(setCountries)
      .catch(err => console.error('Failed to load countries:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
        setShowDurationDropdown(false);
        setShowPolicyTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({ ...prev, country }));
    setSearchTerm(country);
    setShowDropdown(false);
  };

  const handleDurationSelect = (value) => {
    setFormData(prev => ({ ...prev, duration: value }));
    setShowDurationDropdown(false);
  };

  const handlePolicyTypeSelect = (value) => {
    setFormData(prev => ({ ...prev, policyType: value }));
    setShowPolicyTypeDropdown(false);
  };

  const getDurationLabel = () => {
    const option = durationOptions.find(opt => opt.value === formData.duration);
    return option ? option.label : `${formData.duration} Years`;
  };

  const getPolicyTypeLabel = () => {
    const option = policyTypeOptions.find(opt => opt.value === formData.policyType);
    return option ? option.label : formData.policyType;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country || !formData.carbonPrice) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="w-full">
      <h2 className="text-[#00FF6F] text-5xl font-bold mb-10 uppercase tracking-wide">
        Set Input Parameters
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Duration
            </label>
            <div className="relative dropdown-container">
              <div
                onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                className="w-full px-4 py-3 pr-10 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] cursor-pointer"
              >
                {getDurationLabel()}
              </div>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] text-xs pointer-events-none select-none">
                {showDurationDropdown ? '▲' : '▼'}
              </span>
              {showDurationDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[rgba(26,38,30,0.95)] border border-[rgba(0,255,111,0.3)] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                  {durationOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleDurationSelect(option.value)}
                      className="px-4 py-3 text-white text-base cursor-pointer transition-all duration-200 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F]"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Carbon Price Rate
            </label>
            <input
              type="number"
              name="carbonPrice"
              value={formData.carbonPrice}
              onChange={handleChange}
              placeholder="Enter rate"
              min="1"
              step="0.01"
              className="w-full px-4 py-3 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base placeholder-[rgba(255,255,255,0.4)] transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)]"
            />
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Country
            </label>
            <div className="relative dropdown-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Select Country"
                className="w-full px-4 py-3 pr-10 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base placeholder-[rgba(255,255,255,0.4)] transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] cursor-pointer"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] text-xs pointer-events-none select-none">
                {showDropdown ? '▲' : '▼'}
              </span>
              {showDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[rgba(26,38,30,0.95)] border border-[rgba(0,255,111,0.3)] rounded-lg max-h-60 overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className="px-4 py-3 text-white text-base cursor-pointer transition-all duration-200 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F]"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Policy Type
            </label>
            <div className="relative dropdown-container">
              <div
                onClick={() => setShowPolicyTypeDropdown(!showPolicyTypeDropdown)}
                className="w-full px-4 py-3 pr-10 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] cursor-pointer"
              >
                {getPolicyTypeLabel()}
              </div>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] text-xs pointer-events-none select-none">
                {showPolicyTypeDropdown ? '▲' : '▼'}
              </span>
              {showPolicyTypeDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[rgba(26,38,30,0.95)] border border-[rgba(0,255,111,0.3)] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                  {policyTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handlePolicyTypeSelect(option.value)}
                      className="px-4 py-3 text-white text-base cursor-pointer transition-all duration-200 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F]"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Coverage ({formData.coverage}%)
            </label>
            <p className="text-[rgba(255,255,255,0.4)] text-xs font-normal leading-relaxed mb-2">
              EU ETS: ~45%, California: ~80%, Typical tax: 20-40%
            </p>
            <input
              type="range"
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              min="10"
              max="90"
              className="w-full h-2 bg-[rgba(10,13,11,0.6)] rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00FF6F 0%, #00FF6F ${((formData.coverage - 10) / 80) * 100}%, rgba(255,255,255,0.1) ${((formData.coverage - 10) / 80) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-[rgba(255,255,255,0.4)] mt-1">
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-[50px] py-[18px] rounded-[10px] bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-[1px] min-w-[200px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {!hasResults && !loading && (
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-[rgba(255,255,255,0.4)] text-xs leading-relaxed font-extralight tracking-wide">
            Configure key policy settings including duration, carbon price, coverage, and country. Generate real-time projections of how your carbon pricing policy will affect both the environment and the economy. After running the simulation, Eco-Impact AI displays clear insights on revenue predictions, CO2 reduction potential, policy risk assessment, and environmental equivalencies, supported by interactive charts and year-by-year projections for deeper analysis.
          </p>
        </div>
      )}
    </div>
  );
}
