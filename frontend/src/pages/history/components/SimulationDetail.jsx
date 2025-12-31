import ResultsDisplay from '../../simulate/components/ResultsDisplay';

export default function SimulationDetail({ simulation, onBack }) {
  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
      >
        ← Back to History
      </button>
      <div className="mb-8">
        <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide mb-4">
          {simulation.policy_name || 'Simulation Details'}
        </h1>
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

