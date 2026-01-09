import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ProjectionsSection({ results, isComparison = false }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const projections = results.projections || [];

  const years = projections.map(p => p.year);
  const cumulativeRevenues = projections.map(p => p.cumulative_revenue_million || 0);
  const cumulativeCo2Reduced = projections.map(p => p.co2_reduced_cumulative_mt || 0);
  const risks = projections.map(p => p.abolishment_risk_percent);

  const maxRevenue = Math.max(...cumulativeRevenues, 1);
  const maxCo2 = Math.max(...cumulativeCo2Reduced, 1);
  const primaryColor = isDark ? '#10B981' : '#2D7A4F';
  const accentColor = isDark ? '#34D399' : '#4FB37A';
  const textColor = isDark ? '#CBD5E1' : '#5C4E3D';
  const gridColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
  const bgColor = isDark ? '#0A0D0B' : '#FFFFFF';
  
  const revenueTrace = {
    x: years,
    y: cumulativeRevenues,
    name: 'Cumulative Revenue',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: primaryColor, width: 3 },
    marker: { size: 10, color: primaryColor, line: { width: 2, color: bgColor } },
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
    line: { color: accentColor, width: 3, dash: 'dash' },
    marker: { size: 10, color: accentColor, line: { width: 2, color: bgColor } },
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
      color: textColor,
      gridcolor: isDark ? '#1a4d45' : '#E5E7EB',
      titlefont: { size: 10 },
      tickfont: { size: 9 },
      showgrid: true,
      gridwidth: 1,
      domain: [0, 1],
      anchor: 'y'
    },
    yaxis: {
      title: 'Cumulative Revenue (Million USD)',
      titlefont: { color: primaryColor, size: 10 },
      tickfont: { color: primaryColor, size: 9 },
      color: primaryColor,
      gridcolor: gridColor,
      showgrid: true,
      gridwidth: 1,
      range: [0, maxRevenue * 1.1],
      domain: [0.55, 1]
    },
    xaxis2: {
      title: 'Year',
      color: textColor,
      gridcolor: isDark ? '#1a4d45' : '#E5E7EB',
      titlefont: { size: 10 },
      tickfont: { size: 9 },
      showgrid: true,
      gridwidth: 1,
      domain: [0, 1],
      anchor: 'y2'
    },
    yaxis2: {
      title: 'Cumulative CO2 Reduced (Million Tonnes)',
      titlefont: { color: accentColor, size: 10 },
      tickfont: { color: accentColor, size: 9 },
      color: accentColor,
      gridcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(79, 179, 122, 0.15)',
      showgrid: true,
      gridwidth: 1,
      range: [0, maxCo2 * 1.1],
      domain: [0, 0.45]
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: textColor, size: 9 },
    margin: { l: 70, r: 40, t: isComparison ? 60 : 30, b: 60 },
    height: isComparison ? 450 : 500,
    showlegend: true,
    legend: {
      x: isComparison ? 0.5 : 0.02,
      y: isComparison ? 1.05 : 0.98,
      xanchor: isComparison ? 'center' : 'left',
      yanchor: isComparison ? 'bottom' : 'top',
      orientation: isComparison ? 'h' : 'v',
      bgcolor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      bordercolor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(45, 122, 79, 0.2)',
      borderwidth: 1,
      font: { size: isComparison ? 8 : 9, color: textColor }
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
      color: textColor,
      gridcolor: isDark ? '#1a4d45' : '#E5E7EB',
      titlefont: { size: 10 },
      tickfont: { size: 9 }
    },
    yaxis: {
      title: 'Abolishment Risk (%)',
      color: textColor,
      gridcolor: isDark ? '#1a4d45' : '#E5E7EB',
      range: [0, Math.max(...risks) * 1.2]
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: textColor },
    margin: { l: 60, r: 40, t: 40, b: 60 },
    height: 300,
    showlegend: false
  };

  return (
    <div className="results-section animate-scale-in" style={{ animationDelay: '0.6s' }}>
      <div className="results-section-header">
        <h2 className="results-section-title">Multi-Year Projections</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {projections.length > 0 && (
            <div className="results-chart-container animate-chart-reveal" style={{ animationDelay: '0.7s' }}>
              <h3 className="results-chart-title">Revenue & CO2 Trend</h3>
              <Plot
                key={`revenue-co2-${theme}`}
                data={revenueCo2Data}
                layout={{...revenueCo2Layout, height: Math.min(550, Math.max(450, projections.length * 45))}}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
              />
            </div>
          )}

          <div className="results-chart-container overflow-hidden">
            <h3 className="results-chart-title p-3 pb-2" style={{ borderBottom: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)'}` }}>Year-by-Year Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)'}` }}>
                    <th className="text-left text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Year</th>
                    <th className="text-right text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight" style={{ color: 'var(--text-secondary)' }}>
                      Cumulative Revenue<br />Million USD
                    </th>
                    <th className="text-right text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight" style={{ color: 'var(--text-secondary)' }}>
                      Cumulative CO2<br />Reduction (Million Tonnes)
                    </th>
                    <th className="text-right text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-normal leading-tight" style={{ color: 'var(--text-secondary)' }}>
                      Abolishment Risk<br />Probability
                    </th>
                    <th className="text-right text-xs font-semibold py-2 px-3 uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Risk Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((proj, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(45, 122, 79, 0.05)'}` }} className="hover:opacity-80 transition-opacity">
                      <td className="font-semibold py-2 px-3 text-sm" style={{ color: 'var(--text-primary)' }}>{proj.year}</td>
                      <td className="text-right py-2 px-3 font-bold text-sm" style={{ color: primaryColor }}>
                        ${(proj.cumulative_revenue_million || 0).toFixed(2)}M
                      </td>
                      <td className="text-right py-2 px-3 font-bold text-sm" style={{ color: accentColor }}>
                        {proj.co2_reduced_cumulative_mt?.toFixed(3)}M
                      </td>
                      <td className="text-right py-2 px-3 font-semibold text-sm" style={{ color: '#fbbf24' }}>
                        {proj.abolishment_risk_percent?.toFixed(1)}%
                      </td>
                      <td className="text-right py-2 px-3">
                        <span className={proj.risk_category === 'Low Risk' ? 'results-badge results-badge-low' :
                          proj.risk_category === 'At Risk' ? 'results-badge results-badge-medium' :
                          'results-badge results-badge-high'}>
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
