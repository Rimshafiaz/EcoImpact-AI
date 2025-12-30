export default function HeroCards({ results }) {
  const survivalProbability = 100 - (results.abolishment_risk_percent || 0);

  const cumulativeRevenue = (() => {
    const projections = results.projections || [];
    if (projections.length > 0) {
      const lastProjection = projections[projections.length - 1];
      if (lastProjection.cumulative_revenue_million !== undefined && lastProjection.cumulative_revenue_million !== null) {
        return lastProjection.cumulative_revenue_million.toFixed(2);
      }
      const total = projections.reduce((sum, p) => sum + (p.revenue_million || 0), 0);
      return total.toFixed(2);
    }
    return (results.revenue_million || 0).toFixed(2);
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[rgba(26,38,30,0.8)] rounded-xl p-6 border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_0_20px_rgba(0,255,111,0.2)] transition-all duration-300 transform hover:-translate-y-1">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Cumulative Revenue</p>
        <p className="text-[#00FF6F] text-4xl font-bold mb-1">
          ${cumulativeRevenue}M
        </p>
        <p className="text-gray-500 text-xs">Over {results.projections?.length || 1} year{results.projections?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-[rgba(26,38,30,0.8)] rounded-xl p-6 border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_0_20px_rgba(0,255,111,0.2)] transition-all duration-300 transform hover:-translate-y-1">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Policy Survival</p>
        <p className={`text-4xl font-bold mb-1 ${
          results.risk_category === 'Low Risk' ? 'text-green-400' :
          results.risk_category === 'At Risk' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {survivalProbability.toFixed(1)}%
        </p>
        <p className="text-gray-500 text-xs">
          {results.risk_category}
        </p>
      </div>

      <div className="bg-[rgba(26,38,30,0.8)] rounded-xl p-6 border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_0_20px_rgba(0,255,111,0.2)] transition-all duration-300 transform hover:-translate-y-1">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">CO2 Reduction</p>
        <p className="text-blue-400 text-4xl font-bold mb-1">
          {results.co2_reduced_mt?.toFixed(2)}M
        </p>
        <p className="text-gray-500 text-xs">Tonnes/year</p>
      </div>
    </div>
  );
}
