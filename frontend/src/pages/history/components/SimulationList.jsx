import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SimulationList({
  simulations,
  allSimulations,
  loading,
  onSimulationClick,
  onRefresh,
  onDelete,
  onEditName,
  searchTerm,
  onSearchChange,
  filterCountry,
  onFilterCountryChange,
  filterPolicyType,
  onFilterPolicyTypeChange,
  uniqueCountries,
  uniquePolicyTypes
}) {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const handleEditClick = (e, sim) => {
    e.stopPropagation();
    setEditingId(sim.id);
    setEditName(sim.policy_name || '');
  };

  const handleSaveEdit = async (e, simId) => {
    e.stopPropagation();
    if (editName.trim()) {
      await onEditName(simId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteClick = async (e, simId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      await onDelete(simId);
    }
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center" style={{ color: 'var(--primary-green)' }}>Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: 'var(--primary-green)' }}>
          My Simulations
        </h1>
        <button
          onClick={onRefresh}
          className="px-6 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
            color: 'var(--primary-green)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)';
          }}
        >
          Refresh
        </button>
      </div>

      <div 
        className="mb-6 rounded-xl border p-4"
        style={{
          backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or country..."
              className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
              style={{
                backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Filter by Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => onFilterCountryChange(e.target.value)}
              className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
              style={{
                backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Filter by Policy Type
            </label>
            <select
              value={filterPolicyType}
              onChange={(e) => onFilterPolicyTypeChange(e.target.value)}
              className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
              style={{
                backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}
            >
              <option value="">All Types</option>
              {uniquePolicyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || filterCountry || filterPolicyType) && (
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>Showing {simulations.length} of {allSimulations.length} simulations</span>
            <button
              onClick={() => {
                onSearchChange('');
                onFilterCountryChange('');
                onFilterPolicyTypeChange('');
              }}
              className="transition-colors"
              style={{ color: 'var(--primary-green)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-green)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--primary-green)'}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {simulations.length === 0 ? (
        <div 
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'
          }}
        >
          {allSimulations.length === 0 ? (
            <>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>No simulations found</p>
              <p style={{ color: 'var(--text-tertiary)' }}>Run some simulations first to view them here</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>No simulations match your filters</p>
              <p style={{ color: 'var(--text-tertiary)' }}>Try adjusting your search or filters</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <div
              key={`${sim.id}-${theme}`}
              className="rounded-xl border transition-all duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 20px rgba(45, 122, 79, 0.3)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(45, 122, 79, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)';
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  {editingId === sim.id ? (
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(e, sim.id);
                          if (e.key === 'Escape') handleCancelEdit(e);
                        }}
                        className="w-full rounded px-2 py-1 text-lg font-bold focus:outline-none"
                        style={{
                          backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
                          border: '1px solid var(--primary-green)',
                          color: 'var(--primary-green)'
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3
                      onClick={() => onSimulationClick(sim.id)}
                      className="text-xl font-bold cursor-pointer flex-1"
                      style={{ color: 'var(--primary-green)' }}
                    >
                      {sim.policy_name || `${sim.policy_type} - ${sim.country}`}
                    </h3>
                  )}
                  <div className="flex gap-2">
                    {editingId === sim.id ? (
                      <>
                        <button
                          onClick={(e) => handleSaveEdit(e, sim.id)}
                          className="transition-colors p-1 rounded"
                          style={{ 
                            color: '#10b981',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#34d399';
                            e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#10b981';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          title="Save"
                          key={`save-${theme}-${sim.id}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="transition-colors p-1 rounded"
                          style={{ 
                            color: '#ef4444',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#f87171';
                            e.target.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#ef4444';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          title="Cancel"
                          key={`cancel-${theme}-${sim.id}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleEditClick(e, sim)}
                          className="transition-colors p-1 rounded"
                          style={{ 
                            color: '#3b82f6',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#60a5fa';
                            e.target.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#3b82f6';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          title="Edit name"
                          key={`edit-${theme}-${sim.id}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, sim.id)}
                          className="transition-colors p-1 rounded"
                          style={{ 
                            color: '#ef4444',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#f87171';
                            e.target.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#ef4444';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          title="Delete"
                          key={`delete-${theme}-${sim.id}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div
                  onClick={() => onSimulationClick(sim.id)}
                  className="space-y-2 text-sm cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Country:</span>
                    <span>{sim.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                    <span>{sim.policy_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Revenue:</span>
                    <span style={{ color: 'var(--primary-green)' }}>${sim.revenue_million.toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Risk:</span>
                    <span style={{
                      color: sim.risk_category === 'Low Risk' ? '#10b981' :
                             sim.risk_category === 'High Risk' ? '#ef4444' :
                             '#f59e0b'
                    }}>
                      {sim.risk_category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Coverage:</span>
                    <span>{sim.coverage_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                    <span>{new Date(sim.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

