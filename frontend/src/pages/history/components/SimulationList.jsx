import { useState } from 'react';

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
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

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
        <div className="text-center text-[#00FF6F]">Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide">
          My Simulations
        </h1>
        <button
          onClick={onRefresh}
          className="px-6 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or country..."
              className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-[#00FF6F] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Filter by Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => onFilterCountryChange(e.target.value)}
              className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Filter by Policy Type
            </label>
            <select
              value={filterPolicyType}
              onChange={(e) => onFilterPolicyTypeChange(e.target.value)}
              className="w-full bg-[#0A0D0B] border border-[rgba(0,255,111,0.3)] rounded-lg px-4 py-2 text-white focus:border-[#00FF6F] focus:outline-none"
            >
              <option value="">All Types</option>
              {uniquePolicyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || filterCountry || filterPolicyType) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <span>Showing {simulations.length} of {allSimulations.length} simulations</span>
            <button
              onClick={() => {
                onSearchChange('');
                onFilterCountryChange('');
                onFilterPolicyTypeChange('');
              }}
              className="text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {simulations.length === 0 ? (
        <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] p-12 text-center">
          {allSimulations.length === 0 ? (
            <>
              <p className="text-gray-400 text-lg mb-4">No simulations found</p>
              <p className="text-gray-500">Run some simulations first to view them here</p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-lg mb-4">No simulations match your filters</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,111,0.3)] hover:border-[rgba(0,255,111,0.4)]"
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
                        className="w-full bg-[#0A0D0B] border border-[#00FF6F] rounded px-2 py-1 text-[#00FF6F] text-lg font-bold focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3
                      onClick={() => onSimulationClick(sim.id)}
                      className="text-xl font-bold text-[#00FF6F] cursor-pointer flex-1"
                    >
                      {sim.policy_name || `${sim.policy_type} - ${sim.country}`}
                    </h3>
                  )}
                  <div className="flex gap-2">
                    {editingId === sim.id ? (
                      <>
                        <button
                          onClick={(e) => handleSaveEdit(e, sim.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Save"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Cancel"
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
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit name"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, sim.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
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
                  className="space-y-2 text-sm text-gray-300 cursor-pointer"
                >
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

