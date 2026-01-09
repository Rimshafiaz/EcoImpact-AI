import { useCountUp } from '../../../utils/useCountUp';

export default function HeroCards({ results, startCounting = false }) {
  const survivalProbability = 100 - (results.abolishment_risk_percent || 0);

  const cumulativeRevenueValue = (() => {
    const projections = results.projections || [];
    if (projections.length > 0) {
      const lastProjection = projections[projections.length - 1];
      if (lastProjection.cumulative_revenue_million !== undefined && lastProjection.cumulative_revenue_million !== null) {
        return lastProjection.cumulative_revenue_million;
      }
      const total = projections.reduce((sum, p) => sum + (p.revenue_million || 0), 0);
      return total;
    }
    return results.revenue_million || 0;
  })();

  // Delay counting until after scroll (800ms for smooth scroll + 200ms buffer)
  const countDelay = startCounting ? 0 : 800;
  const countRevenue = useCountUp(cumulativeRevenueValue, 1000, 2, countDelay);
  const countSurvival = useCountUp(survivalProbability, 1000, 1, countDelay);
  const countCO2 = useCountUp(results.co2_reduced_mt || 0, 1200, 2, countDelay);

  const getRiskColor = () => {
    if (results.risk_category === 'Low Risk') return 'var(--primary-green)';
    if (results.risk_category === 'At Risk') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="hero-card animate-count-up" style={{ animationDelay: '0.1s' }}>
        <p className="hero-card-label">Cumulative Revenue</p>
        <p className="hero-card-value">
          ${countRevenue.toFixed(2)}M
        </p>
        <p className="hero-card-sub">Over {results.projections?.length || 1} year{results.projections?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="hero-card animate-count-up" style={{ animationDelay: '0.2s' }}>
        <p className="hero-card-label">Policy Survival</p>
        <p className="text-4xl font-bold mb-1" style={{ color: getRiskColor() }}>
          {countSurvival.toFixed(1)}%
        </p>
        <p className="hero-card-sub">
          {results.risk_category}
        </p>
      </div>

      <div className="hero-card animate-count-up" style={{ animationDelay: '0.3s' }}>
        <p className="hero-card-label">CO2 Reduction</p>
        <p className="hero-card-value">
          {countCO2.toFixed(2)}M
        </p>
        <p className="hero-card-sub">Tonnes/year</p>
      </div>
    </div>
  );
}
