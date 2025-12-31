import { useState } from 'react';

export default function SimulationList({ 
  simulations, 
  loading, 
  onSimulationClick, 
  onCompareTwo,
  onNewComparison,
  onRefresh,
  onDelete
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [maxSelectionWarning, setMaxSelectionWarning] = useState(false);

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
        <div className="text-center text-[#00FF6F]">Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide">
          Compare Policies
        </h1>
        <div className="flex gap-4">
          <button
            onClick={onNewComparison}
            className="px-6 py-2 bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            New Comparison
          </button>
          <button
            onClick={onRefresh}
            className="px-6 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${
          selectedIds.size === 2 
            ? 'bg-[rgba(0,255,111,0.1)] border border-[rgba(0,255,111,0.3)]' 
            : 'bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.3)]'
        }`}>
          <div className="flex items-center gap-4">
            <span className={selectedIds.size === 2 ? 'text-[#00FF6F]' : 'text-orange-400'}>
              {selectedIds.size} {selectedIds.size === 1 ? 'simulation' : 'simulations'} selected
            </span>
            {selectedIds.size === 2 && (
              <span className="text-sm text-gray-400">You can compare these two policies</span>
            )}
            {selectedIds.size === 1 && (
              <span className="text-sm text-gray-400">Select one more to compare</span>
            )}
          </div>
          {selectedIds.size === 2 && (
            <button
              onClick={handleCompare}
              className="px-8 py-3 bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,111,0.5)] transition-all duration-300 hover:scale-105 uppercase tracking-wide"
            >
              Compare Selected
            </button>
          )}
        </div>
      )}

      {maxSelectionWarning && (
        <div className="mb-6 p-4 bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.5)] rounded-lg">
          <p className="text-orange-400 text-center">
            Maximum 2 simulations can be compared at once. Please deselect one to select another.
          </p>
        </div>
      )}

      {simulations.length === 0 ? (
        <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No simulations found</p>
          <p className="text-gray-500">Run some simulations first to compare them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              onClick={() => onSimulationClick(sim.id)}
              className={`bg-[rgba(26,38,30,0.8)] rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,111,0.3)] ${
                selectedIds.has(sim.id)
                  ? 'border-[#00FF6F] shadow-[0_0_20px_rgba(0,255,111,0.5)]'
                  : 'border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.4)]'
              }`}
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
                  <h3 className="text-xl font-bold text-[#00FF6F]">
                    {sim.policy_name || `${sim.policy_type} - ${sim.country}`}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sim.id)}
                      onChange={() => toggleSelection(sim.id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={!selectedIds.has(sim.id) && selectedIds.size >= 2}
                      className={`w-5 h-5 accent-[#00FF6F] ${
                        !selectedIds.has(sim.id) && selectedIds.size >= 2 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer'
                      }`}
                      title={!selectedIds.has(sim.id) && selectedIds.size >= 2 
                        ? 'Maximum 2 simulations can be compared. Deselect one first.' 
                        : 'Select for comparison'
                      }
                    />
                    <button
                      onClick={(e) => handleDeleteClick(e, sim.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country:</span>
                    <span>{sim.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span>{sim.policy_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue:</span>
                    <span className="text-[#00FF6F]">${sim.revenue_million.toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk:</span>
                    <span className={`${
                      sim.risk_category === 'Low Risk' ? 'text-green-400' :
                      sim.risk_category === 'High Risk' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {sim.risk_category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coverage:</span>
                    <span>{sim.coverage_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
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

