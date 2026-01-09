import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../../../contexts/ThemeContext';

export default function FinancialSection({ results, isComparison = false }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const projections = results.projections || [];
  const years = projections.map(p => p.year);
  const cumulativeRevenues = projections.map(p => p.cumulative_revenue_million || 0);
  
  let cumulativeRiskAdjusted = 0;
  const cumulativeRiskAdjustedValues = projections.map(p => {
    cumulativeRiskAdjusted += (p.risk_adjusted_value_million || 0);
    return cumulativeRiskAdjusted;
  });
  const primaryColor = isDark ? '#10B981' : '#2D7A4F';
  const textColor = isDark ? '#CBD5E1' : '#5C4E3D';
  const gridColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';

  const revenueData = [{
    x: years,
    y: cumulativeRevenues,
    name: 'Cumulative Revenue',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: primaryColor, width: 3 },
    marker: { size: 8, color: primaryColor },
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
      color: textColor,
      gridcolor: gridColor,
      titlefont: { size: 10 },
      tickfont: { size: 9 }
    },
    yaxis: {
      title: 'Cumulative Revenue (Million USD)',
      color: textColor,
      gridcolor: gridColor,
      titlefont: { size: 10 },
      tickfont: { size: 9 }
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: textColor, size: 9 },
    margin: { l: 60, r: 40, t: isComparison ? 60 : 50, b: 60 },
    height: 350,
    legend: {
      x: isComparison ? 0.5 : 0.02,
      y: isComparison ? 1.05 : 1.02,
      xanchor: isComparison ? 'center' : 'left',
      yanchor: isComparison ? 'bottom' : 'bottom',
      orientation: isComparison ? 'h' : 'v',
      bgcolor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      bordercolor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(45, 122, 79, 0.2)',
      borderwidth: 1,
      font: { size: isComparison ? 8 : 9, color: textColor }
    }
  };

  return (
    <div className="results-section">
      <div className="results-section-header">
        <h2 className="results-section-title">Financial Analysis</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <p className="results-stat-label">Expected Revenue</p>
            <p className="results-stat-value text-lg lg:text-2xl">${results.revenue_million?.toFixed(2)}M</p>
            <p className="results-stat-sub">Per year</p>
          </div>

          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <p className="results-stat-label">Risk-Adjusted</p>
            <p className="results-stat-value text-lg lg:text-2xl" style={{ color: '#fbbf24' }}>${results.risk_adjusted_value_million?.toFixed(2)}M</p>
            <p className="results-stat-sub">{results.abolishment_risk_percent?.toFixed(1)}% risk</p>
          </div>
        </div>

        {projections.length > 0 && (
          <div className="results-chart-container animate-chart-reveal" style={{ animationDelay: '0.6s' }}>
            <h3 className="results-chart-title">Revenue Trend</h3>
            <Plot
              key={`revenue-${theme}`}
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
