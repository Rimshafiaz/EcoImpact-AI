import { useState, useEffect } from 'react';
import { getAvailableCountries } from '../../../utils/api/predictions';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';

export default function InputForm({ onSubmit, loading, hasResults }) {
  const { showError } = useNotificationContext();
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
      .catch(err => {
        showError(extractErrorMessage(err));
        console.error('Failed to load countries:', err);
      });
  }, [showError]);

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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.country || !formData.country.trim()) {
      newErrors.country = 'Please select a country';
    }
    
    if (!formData.carbonPrice || parseFloat(formData.carbonPrice) <= 0) {
      newErrors.carbonPrice = 'Please enter a valid carbon price greater than 0';
    }
    
    if (parseFloat(formData.carbonPrice) > 1000) {
      newErrors.carbonPrice = 'Carbon price cannot exceed $1,000 per tonne';
    }
    
    if (!formData.coverage || parseFloat(formData.coverage) < 10 || parseFloat(formData.coverage) > 90) {
      newErrors.coverage = 'Coverage must be between 10% and 90%';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full">
      <h2 className="simulate-title">
        Set Input Parameters
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="simulate-card">
            <label className="simulate-label">
              Duration
            </label>
            <div className="relative dropdown-container">
              <div
                onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                className="simulate-dropdown-trigger"
              >
                {getDurationLabel()}
              </div>
              <span className="simulate-dropdown-arrow">
                {showDurationDropdown ? '▲' : '▼'}
              </span>
              {showDurationDropdown && (
                <div className="simulate-dropdown-menu">
                  {durationOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleDurationSelect(option.value)}
                      className="simulate-dropdown-item"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="simulate-card">
            <label className="simulate-label">
              {formData.policyType === 'Carbon tax' ? 'Tax Rate (USD/tonne)' : 'Carbon Price (USD/tonne)'}
            </label>
            <input
              type="number"
              name="carbonPrice"
              value={formData.carbonPrice}
              onChange={handleChange}
              placeholder={formData.policyType === 'Carbon tax' ? 'Enter tax rate' : 'Enter price'}
              min="1"
              step="0.01"
              className={`simulate-input ${errors.carbonPrice ? 'simulate-input-error' : ''}`}
            />
            {errors.carbonPrice && (
              <p className="simulate-error-text">{errors.carbonPrice}</p>
            )}
          </div>

          <div className="simulate-card">
            <label className="simulate-label">
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
                className={`simulate-dropdown-trigger ${errors.country ? 'simulate-input-error' : ''}`}
              />
              <span className="simulate-dropdown-arrow">
                {showDropdown ? '▲' : '▼'}
              </span>
              {showDropdown && filteredCountries.length > 0 && (
                <div className="simulate-dropdown-menu max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className="simulate-dropdown-item"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.country && (
              <p className="simulate-error-text">{errors.country}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="simulate-card">
            <label className="simulate-label">
              Policy Type
            </label>
            <div className="relative dropdown-container">
              <div
                onClick={() => setShowPolicyTypeDropdown(!showPolicyTypeDropdown)}
                className="simulate-dropdown-trigger"
              >
                {getPolicyTypeLabel()}
              </div>
              <span className="simulate-dropdown-arrow">
                {showPolicyTypeDropdown ? '▲' : '▼'}
              </span>
              {showPolicyTypeDropdown && (
                <div className="simulate-dropdown-menu">
                  {policyTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handlePolicyTypeSelect(option.value)}
                      className="simulate-dropdown-item"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="simulate-card">
            <label className="simulate-label">
              Coverage ({formData.coverage}%)
            </label>
            <p className="simulate-helper-text">
              Percentage of total emissions covered by the policy
            </p>
            <input
              type="range"
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              min="10"
              max="90"
              className="simulate-slider"
              style={{
                background: `linear-gradient(to right, var(--primary-green) 0%, var(--primary-green) ${((formData.coverage - 10) / 80) * 100}%, var(--slider-track) ${((formData.coverage - 10) / 80) * 100}%, var(--slider-track) 100%)`
              }}
            />
            {errors.coverage && (
              <p className="simulate-error-text">{errors.coverage}</p>
            )}
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="simulate-button"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {!hasResults && !loading && (
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="simulate-description">
            Configure key policy settings including duration, carbon price, coverage, and country. Generate real-time projections of how your carbon pricing policy will affect both the environment and the economy. After running the simulation, Eco-Impact AI displays clear insights on revenue predictions, CO2 reduction potential, policy risk assessment, and environmental equivalencies, supported by interactive charts and year-by-year projections for deeper analysis.
          </p>
        </div>
      )}
    </div>
  );
}
