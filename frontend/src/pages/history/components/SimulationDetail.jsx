import { useState, useEffect } from 'react';
import ResultsDisplay from '../../simulate/components/ResultsDisplay';
import { updateSimulationName } from '../../../utils/api/simulations';
import { exportToCSV, exportToPDF } from '../../../utils/export';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SimulationDetail({ simulation, onBack, onUpdate }) {
  const { showError, showSuccess } = useNotificationContext();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(simulation.policy_name || '');
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const handleSave = async () => {
    if (editName.trim()) {
      try {
        await updateSimulationName(simulation.id, editName.trim());
        if (onUpdate) onUpdate();
        setIsEditing(false);
        showSuccess('Simulation name updated successfully', 2000);
      } catch (err) {
        showError(extractErrorMessage(err));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="transition-colors px-3 py-1 rounded"
          style={{ 
            color: 'var(--primary-green)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--accent-green)';
            e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'var(--primary-green)';
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          ← Back to History
        </button>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => {
              try {
                exportToCSV(simulation);
                showSuccess('CSV exported successfully', 2000);
              } catch (error) {
                showError(extractErrorMessage(error));
              }
            }}
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
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
            Export CSV
          </button>
          <button
            onClick={async () => {
              try {
                await exportToPDF(simulation);
                showSuccess('PDF exported successfully', 2000);
              } catch (error) {
                showError(extractErrorMessage(error));
              }
            }}
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
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
            Export PDF
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="transition-colors text-sm px-3 py-1 rounded"
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
              key={`edit-btn-${theme}`}
            >
              Edit Name
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="transition-colors text-sm px-3 py-1 rounded"
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
                key={`save-btn-${theme}`}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(simulation.policy_name || '');
                }}
                className="transition-colors text-sm px-3 py-1 rounded"
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
                key={`cancel-btn-${theme}`}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mb-8">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditName(simulation.policy_name || '');
              }
            }}
            className="text-4xl font-bold uppercase tracking-wide mb-4 rounded px-4 py-2 focus:outline-none w-full"
            style={{
              backgroundColor: isDark ? '#0A0D0B' : 'var(--bg-secondary)',
              border: '1px solid var(--primary-green)',
              color: 'var(--primary-green)'
            }}
            autoFocus
          />
        ) : (
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--primary-green)' }}>
            {simulation.policy_name || 'Simulation Details'}
          </h1>
        )}
        <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            {simulation.input_params?.country || 'N/A'}
          </span>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            {simulation.input_params?.policy_type || 'N/A'}
          </span>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            ${simulation.input_params?.carbon_price_usd || 'N/A'}/tonne
          </span>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            {simulation.input_params?.coverage_percent || 'N/A'}% coverage
          </span>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            {simulation.input_params?.projection_years || 'N/A'} years
          </span>
          <span className="px-3 py-1 rounded-full border" style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
          }}>
            {new Date(simulation.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <ResultsDisplay 
        results={simulation.results}
        inputData={{
          country: simulation.input_params?.country,
          policyType: simulation.input_params?.policy_type,
          carbonPrice: simulation.input_params?.carbon_price_usd,
          coverage: simulation.input_params?.coverage_percent,
          year: simulation.input_params?.year,
          duration: simulation.input_params?.projection_years
        }}
      />
    </div>
  );
}

