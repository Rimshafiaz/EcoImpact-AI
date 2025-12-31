import Plot from 'react-plotly.js';

export default function ProjectionsSection({ results }) {
  const projections = results.projections || [];

  const years = projections.map(p => p.year);
  const cumulativeRevenues = projections.map(p => p.cumulative_revenue_million || 0);
  const cumulativeCo2Reduced = projections.map(p => p.co2_reduced_cumulative_mt || 0);
  const risks = projections.map(p => p.abolishment_risk_percent);

  const maxRevenue = Math.max(...cumulativeRevenues, 1);
  const maxCo2 = Math.max(...cumulativeCo2Reduced, 1);
  
  const revenueTrace = {
    x: years,
    y: cumulativeRevenues,
    name: 'Cumulative Revenue',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#00FF6F', width: 3 },
    marker: { size: 10, color: '#00FF6F', line: { width: 2, color: '#0A0D0B' } },
    hovertemplate: 'Year %{x}<br>Cumulative Revenue: $%{y:.2f}M<extra></extra>',
    xaxis: 'x',
    yaxis: 'y'
  };

  const co2Trace = {
    x: years,
    y: cumulativeCo2Reduced,
    name: 'Cumulative CO2 Reduced',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#60a5fa', width: 3, dash: 'dash' },
    marker: { size: 10, color: '#60a5fa', line: { width: 2, color: '#0A0D0B' } },
    hovertemplate: 'Year %{x}<br>Cumulative CO2: %{y:.3f}M tonnes<extra></extra>',
    xaxis: 'x2',
    yaxis: 'y2'
  };

  const revenueCo2Data = [revenueTrace, co2Trace];
  
  const revenueCo2Layout = {
    grid: {
      rows: 2,
      columns: 1,
      pattern: 'independent',
      roworder: 'top to bottom'
    },
    xaxis: {
      title: 'Year',
      color: '#9ca3af',
      gridcolor: '#1a4d45',
      titlefont: { size: 10 },
      tickfont: { size: 9 },
      showgrid: true,
      gridwidth: 1,
      domain: [0, 1],
      anchor: 'y'
    },
    yaxis: {
      title: 'Cumulative Revenue (Million USD)',
      titlefont: { color: '#00FF6F', size: 10 },
      tickfont: { color: '#00FF6F', size: 9 },
      color: '#00FF6F',
      gridcolor: 'rgba(0, 255, 111, 0.15)',
      showgrid: true,
      gridwidth: 1,
      range: [0, maxRevenue * 1.1],
      domain: [0.55, 1]
    },
    xaxis2: {
      title: 'Year',
      color: '#9ca3af',
      gridcolor: '#1a4d45',
      titlefont: { size: 10 },
      tickfont: { size: 9 },
      showgrid: true,
      gridwidth: 1,
      domain: [0, 1],
      anchor: 'y2'
    },
    yaxis2: {
      title: 'Cumulative CO2 Reduced (Million Tonnes)',
      titlefont: { color: '#60a5fa', size: 10 },
      tickfont: { color: '#60a5fa', size: 9 },
      color: '#60a5fa',
      gridcolor: 'rgba(96, 165, 250, 0.15)',
      showgrid: true,
      gridwidth: 1,
      range: [0, maxCo2 * 1.1],
      domain: [0, 0.45]
    },
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af', size: 9 },
    margin: { l: 70, r: 40, t: 30, b: 60 },
    height: 500,
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: '#0d2a26',
      bordercolor: '#1a4d45',
      borderwidth: 1,
      font: { size: 9 }
    }
  };

  const riskEvolutionData = [{
    x: years,
    y: risks,
    type: 'scatter',
    mode: 'lines+markers',
    fill: 'tozeroy',
    line: { color: '#f59e0b', width: 3 },
    marker: { size: 8, color: '#f59e0b' },
    fillcolor: 'rgba(245, 158, 11, 0.2)',
    hovertemplate: 'Year %{x}<br>Risk: %{y:.1f}%<extra></extra>'
  }];

  const riskEvolutionLayout = {
    xaxis: {
      title: 'Year',
      color: '#9ca3af',
      gridcolor: '#1a4d45'
    },
    yaxis: {
      title: 'Abolishment Risk (%)',
      color: '#9ca3af',
      gridcolor: '#1a4d45',
      range: [0, Math.max(...risks) * 1.2]
    },
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af' },
    margin: { l: 60, r: 40, t: 40, b: 60 },
    height: 300,
    showlegend: false
  };

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)]">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Multi-Year Projections</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {projections.length > 0 && (
            <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-3 border border-[rgba(0,255,111,0.1)]">
              <h3 className="text-gray-300 text-sm font-semibold mb-2">Revenue & CO2 Trend</h3>
              <Plot
                data={revenueCo2Data}
                layout={{...revenueCo2Layout, height: Math.min(550, Math.max(450, projections.length * 45))}}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
              />
            </div>
          )}

          <div className="bg-[rgba(10,13,11,0.4)] rounded-lg border border-[rgba(0,255,111,0.1)] overflow-hidden">
          <h3 className="text-gray-300 text-sm font-semibold p-3 pb-2 border-b border-[rgba(0,255,111,0.1)]">Year-by-Year Breakdown</h3>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,111,0.1)]">
                <th className="text-left text-gray-400 text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-nowrap">Year</th>
                <th className="text-right text-gray-400 text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight">
                  Cumulative Revenue<br />Million USD
                </th>
                <th className="text-right text-gray-400 text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight">
                  Cumulative CO2<br />Reduction (Million Tonnes)
                </th>
                <th className="text-right text-gray-400 text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight">
                  Abolishment Risk<br />Probability
                </th>
                <th className="text-right text-gray-400 text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-nowrap">Risk Status</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((proj, idx) => (
                <tr key={idx} className="border-b border-[rgba(0,255,111,0.05)] hover:bg-[rgba(0,255,111,0.05)] transition-colors">
                  <td className="text-white font-semibold py-2 px-3 text-sm">{proj.year}</td>
                  <td className="text-right text-[#00FF6F] py-2 px-3 font-bold text-sm">
                    ${(proj.cumulative_revenue_million || 0).toFixed(2)}M
                  </td>
                  <td className="text-right text-blue-400 py-2 px-3 font-bold text-sm">
                    {proj.co2_reduced_cumulative_mt?.toFixed(3)}M
                  </td>
                  <td className="text-right text-yellow-400 py-2 px-3 font-semibold text-sm">
                    {proj.abolishment_risk_percent?.toFixed(1)}%
                  </td>
                  <td className="text-right py-2 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      proj.risk_category === 'Low Risk' ? 'bg-green-900 text-green-400' :
                      proj.risk_category === 'At Risk' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {proj.risk_category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
