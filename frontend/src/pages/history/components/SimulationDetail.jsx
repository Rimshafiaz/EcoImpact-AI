import { useState } from 'react';
import ResultsDisplay from '../../simulate/components/ResultsDisplay';
import { updateSimulationName } from '../../../utils/api/simulations';
import { exportToCSV, exportToPDF } from '../../../utils/export';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';

export default function SimulationDetail({ simulation, onBack, onUpdate }) {
  const { showError, showSuccess } = useNotificationContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(simulation.policy_name || '');

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
          className="text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
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
            className="px-4 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors text-sm font-semibold"
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
            className="px-4 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors text-sm font-semibold"
          >
            Export PDF
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              Edit Name
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-green-400 hover:text-green-300 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(simulation.policy_name || '');
                }}
                className="text-red-400 hover:text-red-300 transition-colors text-sm"
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
            className="text-4xl font-bold uppercase tracking-wide mb-4 bg-[#0A0D0B] border border-[#00FF6F] rounded px-4 py-2 text-[#00FF6F] focus:outline-none w-full"
            autoFocus
          />
        ) : (
          <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide mb-4">
            {simulation.policy_name || 'Simulation Details'}
          </h1>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {simulation.input_params?.country || 'N/A'}
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {simulation.input_params?.policy_type || 'N/A'}
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            ${simulation.input_params?.carbon_price_usd || 'N/A'}/tonne
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {simulation.input_params?.coverage_percent || 'N/A'}% coverage
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {simulation.input_params?.projection_years || 'N/A'} years
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
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

