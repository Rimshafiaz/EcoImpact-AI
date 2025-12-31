import { useState } from 'react';

export default function SimulationList({
  simulations,
  allSimulations,
  loading,
  onSimulationClick,
  onRefresh,
  searchTerm,
  onSearchChange,
  filterCountry,
  onFilterCountryChange,
  filterPolicyType,
  onFilterPolicyTypeChange,
  uniqueCountries,
  uniquePolicyTypes
}) {
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
              onClick={() => onSimulationClick(sim.id)}
              className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,111,0.3)] hover:border-[rgba(0,255,111,0.4)]"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#00FF6F] mb-4">
                  {sim.policy_name || `${sim.policy_type} - ${sim.country}`}
                </h3>
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

