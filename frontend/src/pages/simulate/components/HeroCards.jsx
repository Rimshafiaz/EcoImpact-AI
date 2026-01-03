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

  const getRiskColor = () => {
    if (results.risk_category === 'Low Risk') return 'var(--primary-green)';
    if (results.risk_category === 'At Risk') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="hero-card">
        <p className="hero-card-label">Cumulative Revenue</p>
        <p className="hero-card-value">
          ${cumulativeRevenue}M
        </p>
        <p className="hero-card-sub">Over {results.projections?.length || 1} year{results.projections?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="hero-card">
        <p className="hero-card-label">Policy Survival</p>
        <p className="text-4xl font-bold mb-1" style={{ color: getRiskColor() }}>
          {survivalProbability.toFixed(1)}%
        </p>
        <p className="hero-card-sub">
          {results.risk_category}
        </p>
      </div>

      <div className="hero-card">
        <p className="hero-card-label">CO2 Reduction</p>
        <p className="hero-card-value">
          {results.co2_reduced_mt?.toFixed(2)}M
        </p>
        <p className="hero-card-sub">Tonnes/year</p>
      </div>
    </div>
  );
}
