import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SimulationList({ 
  simulations, 
  loading, 
  onSimulationClick, 
  onCompareTwo,
  onNewComparison,
  onRefresh,
  onDelete
}) {
  const { theme } = useTheme();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [maxSelectionWarning, setMaxSelectionWarning] = useState(false);
  const isDark = theme === 'dark';

  const handleDeleteClick = async (e, simId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      await onDelete(simId);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      setMaxSelectionWarning(false);
    } else if (newSelected.size < 2) {
      newSelected.add(id);
      setMaxSelectionWarning(false);
    } else {
      setMaxSelectionWarning(true);
      setTimeout(() => setMaxSelectionWarning(false), 3000);
    }
    setSelectedIds(newSelected);
  };

  const handleCompare = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 2) {
      onCompareTwo(ids[0], ids[1]);
      setSelectedIds(new Set());
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
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-4">
          <button
            onClick={onNewComparison}
            className="px-6 py-2 font-bold rounded-lg transition-opacity"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(135deg, #2D7A4F 0%, #5C9B6F 100%)',
              color: isDark ? '#0A0D0B' : '#FFFFFF'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            New Comparison
          </button>
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
      </div>

      {selectedIds.size > 0 && (
        <div 
          className="mb-6 p-4 rounded-lg flex justify-between items-center"
          style={{
            backgroundColor: selectedIds.size === 2
              ? isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${selectedIds.size === 2
              ? isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'
              : 'rgba(245, 158, 11, 0.3)'}`
          }}
        >
          <div className="flex items-center gap-4">
            <span style={{ color: selectedIds.size === 2 ? 'var(--primary-green)' : '#f59e0b' }}>
              {selectedIds.size} {selectedIds.size === 1 ? 'simulation' : 'simulations'} selected
            </span>
            {selectedIds.size === 2 && (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>You can compare these two policies</span>
            )}
            {selectedIds.size === 1 && (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select one more to compare</span>
            )}
          </div>
          {selectedIds.size === 2 && (
            <button
              onClick={handleCompare}
              className="px-8 py-3 font-bold rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                  : 'linear-gradient(135deg, #2D7A4F 0%, #5C9B6F 100%)',
                color: isDark ? '#0A0D0B' : '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = isDark ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(45, 122, 79, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Compare Selected
            </button>
          )}
        </div>
      )}

      {maxSelectionWarning && (
        <div 
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.5)'
          }}
        >
          <p className="text-center" style={{ color: '#f59e0b' }}>
            Maximum 2 simulations can be compared at once. Please deselect one to select another.
          </p>
        </div>
      )}

      {simulations.length === 0 ? (
        <div 
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'}`
          }}
        >
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>No simulations found</p>
          <p style={{ color: 'var(--text-tertiary)' }}>Run some simulations first to compare them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              onClick={() => onSimulationClick(sim.id)}
              className="rounded-xl border cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
                borderColor: selectedIds.has(sim.id)
                  ? 'var(--primary-green)'
                  : isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)',
                boxShadow: selectedIds.has(sim.id)
                  ? isDark ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(45, 122, 79, 0.5)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (!selectedIds.has(sim.id)) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 20px rgba(45, 122, 79, 0.3)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(45, 122, 79, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.has(sim.id)) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)';
                }
              }}
              onMouseDown={(e) => {
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelection(sim.id);
                }
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                    {sim.policy_name || `${sim.policy_type} - ${sim.country}`}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sim.id)}
                      onChange={() => toggleSelection(sim.id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={!selectedIds.has(sim.id) && selectedIds.size >= 2}
                      className={`w-5 h-5 ${
                        !selectedIds.has(sim.id) && selectedIds.size >= 2 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer'
                      }`}
                      style={{ accentColor: 'var(--primary-green)' }}
                      title={!selectedIds.has(sim.id) && selectedIds.size >= 2 
                        ? 'Maximum 2 simulations can be compared. Deselect one first.' 
                        : 'Select for comparison'
                      }
                    />
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
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
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

