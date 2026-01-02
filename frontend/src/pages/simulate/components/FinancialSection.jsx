import Plot from 'react-plotly.js';

export default function FinancialSection({ results }) {
  const projections = results.projections || [];
  const years = projections.map(p => p.year);
  const cumulativeRevenues = projections.map(p => p.cumulative_revenue_million || 0);
  
  let cumulativeRiskAdjusted = 0;
  const cumulativeRiskAdjustedValues = projections.map(p => {
    cumulativeRiskAdjusted += (p.risk_adjusted_value_million || 0);
    return cumulativeRiskAdjusted;
  });

  const revenueData = [{
    x: years,
    y: cumulativeRevenues,
    name: 'Cumulative Revenue',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#00FF6F', width: 3 },
    marker: { size: 8, color: '#00FF6F' },
    hovertemplate: 'Year %{x}<br>Cumulative Revenue: $%{y:.2f}M<extra></extra>'
  }, {
    x: years,
    y: cumulativeRiskAdjustedValues,
    name: 'Cumulative Risk-Adjusted Value',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#fbbf24', width: 3, dash: 'dash' },
    marker: { size: 8, color: '#fbbf24', symbol: 'diamond' },
    hovertemplate: 'Year %{x}<br>Cumulative Risk-Adjusted: $%{y:.2f}M<extra></extra>'
  }];

  const revenueLayout = {
    xaxis: {
      title: 'Year',
      color: '#9ca3af',
      gridcolor: 'rgba(0, 255, 111, 0.1)',
      titlefont: { size: 10 },
      tickfont: { size: 9 }
    },
    yaxis: {
      title: 'Cumulative Revenue (Million USD)',
      color: '#9ca3af',
      gridcolor: 'rgba(0, 255, 111, 0.1)',
      titlefont: { size: 10 },
      tickfont: { size: 9 }
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#9ca3af', size: 9 },
    margin: { l: 60, r: 40, t: 50, b: 60 },
    height: 350,
    legend: {
      x: 0.02,
      y: 1.02,
      xanchor: 'left',
      yanchor: 'bottom',
      bgcolor: 'rgba(13, 42, 38, 0.8)',
      bordercolor: 'rgba(0, 255, 111, 0.2)',
      borderwidth: 1,
      font: { size: 9 }
    }
  };

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)]">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Financial Analysis</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)] min-w-0 overflow-hidden">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Expected Revenue</p>
            <p className="text-[#00FF6F] text-lg lg:text-2xl font-bold break-words leading-tight">${results.revenue_million?.toFixed(2)}M</p>
            <p className="text-gray-500 text-[10px] mt-1">Per year</p>
          </div>

          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-4 border border-[rgba(255,187,36,0.1)] min-w-0 overflow-hidden">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Risk-Adjusted</p>
            <p className="text-yellow-400 text-lg lg:text-2xl font-bold break-words leading-tight">${results.risk_adjusted_value_million?.toFixed(2)}M</p>
            <p className="text-gray-500 text-[10px] mt-1">{results.abolishment_risk_percent?.toFixed(1)}% risk</p>
          </div>
        </div>

        {projections.length > 0 && (
          <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
            <h3 className="text-gray-300 text-sm font-semibold mb-3">Revenue Trend</h3>
            <Plot
              data={revenueData}
              layout={{...revenueLayout, height: 320, margin: { l: 50, r: 30, t: 20, b: 55 }}}
              config={{ displayModeBar: false, responsive: true }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
