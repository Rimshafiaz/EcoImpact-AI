import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../../../contexts/ThemeContext';

export default function EnvironmentalSection({ results, isComparison = false }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const [animatedCoverage, setAnimatedCoverage] = useState(0);
  const [animatedCovered, setAnimatedCovered] = useState(0);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  
  const coveragePercent = ((results.co2_covered_mt / results.total_country_co2_mt) * 100).toFixed(1);
  const uncoveredPercent = (100 - coveragePercent).toFixed(1);

  // Animate pie chart values
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startCovered = 0;
    const endCovered = results.co2_covered_mt;
    const endTotal = results.total_country_co2_mt;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentCovered = startCovered + (endCovered - startCovered) * easeOutQuart;
      const currentTotal = startCovered + (endTotal - startCovered) * easeOutQuart;
      const currentCoverage = (currentCovered / currentTotal) * 100;
      
      setAnimatedCovered(currentCovered);
      setAnimatedTotal(currentTotal);
      setAnimatedCoverage(currentCoverage);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedCovered(endCovered);
        setAnimatedTotal(endTotal);
        setAnimatedCoverage(parseFloat(coveragePercent));
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 800); // Start after scroll

    return () => clearTimeout(timer);
  }, [results.co2_covered_mt, results.total_country_co2_mt, coveragePercent]);

  const primaryColor = isDark ? '#10B981' : '#2D7A4F';
  const accentColor = isDark ? '#34D399' : '#4FB37A';
  const textColor = isDark ? '#CBD5E1' : '#5C4E3D';
  const bgColor = isDark ? '#0a1f1c' : '#FAF7F3';

  const donutData = [{
    values: [animatedCovered, Math.max(0, animatedTotal - animatedCovered)],
    labels: ['Covered', 'Not Covered'],
    type: 'pie',
    hole: 0.6,
    marker: {
      colors: [accentColor, isDark ? '#1a4d45' : '#D1D5DB']
    },
    textinfo: 'label+percent',
    textfont: { color: textColor },
    hovertemplate: '%{label}: %{value:.2f}M tonnes<extra></extra>'
  }];

  const donutLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: textColor, size: 9 },
    margin: { l: 20, r: 20, t: isComparison ? 60 : 20, b: 20 },
    height: 300,
    showlegend: true,
    legend: {
      x: 0.5,
      xanchor: 'center',
      y: isComparison ? 1.05 : -0.1,
      yanchor: isComparison ? 'bottom' : 'top',
      orientation: 'h',
      bgcolor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      bordercolor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(45, 122, 79, 0.2)',
      borderwidth: 1,
      font: { size: isComparison ? 8 : 9, color: textColor }
    },
    annotations: [{
      text: `${animatedCoverage.toFixed(1)}%`,
      x: 0.5,
      y: 0.5,
      font: { size: 22, color: accentColor },
      showarrow: false
    }]
  };

  const funnelData = [{
    y: ['Total Country Emissions', 'Covered by Policy', 'Potential Reduction'],
    x: [results.total_country_co2_mt, results.co2_covered_mt, results.co2_reduced_mt],
    type: 'funnel',
    marker: {
      color: [isDark ? '#1a4d45' : '#9CA3AF', accentColor, isDark ? '#34D399' : '#5C9B6F']
    },
    textinfo: 'value+percent initial',
    textfont: { color: textColor },
    hovertemplate: '%{y}: %{x:.2f}M tonnes<extra></extra>'
  }];

  const funnelLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: textColor },
    margin: { l: 200, r: 50, t: 20, b: 50 },
    height: 250
  };

  return (
    <div className="results-section">
      <div className="results-section-header">
        <h2 className="results-section-title">Environmental Impact</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <p className="results-stat-label">Total CO2</p>
            <p className="results-stat-value text-base lg:text-xl" style={{ color: 'var(--text-primary)' }}>{results.total_country_co2_mt?.toFixed(1)}M</p>
            <p className="results-stat-sub">tonnes</p>
          </div>
          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.45s' }}>
            <p className="results-stat-label">Covered</p>
            <p className="results-stat-value text-base lg:text-xl" style={{ color: accentColor }}>{results.co2_covered_mt?.toFixed(1)}M</p>
            <p className="results-stat-sub">{coveragePercent}%</p>
          </div>
          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <p className="results-stat-label">Reduced</p>
            <p className="results-stat-value text-base lg:text-xl" style={{ color: isDark ? '#34D399' : '#5C9B6F' }}>{results.co2_reduced_mt?.toFixed(2)}M</p>
            <p className="results-stat-sub">per year</p>
          </div>
          <div className="results-stat-card animate-scale-in" style={{ animationDelay: '0.55s' }}>
            <p className="results-stat-label">Per Capita</p>
            <p className="results-stat-value text-base lg:text-xl" style={{ color: 'var(--text-primary)' }}>{results.co2_covered_per_capita_tonnes?.toFixed(2)}</p>
            <p className="results-stat-sub">tonnes</p>
          </div>
        </div>

        <div className="results-chart-container mb-5 animate-chart-reveal" style={{ animationDelay: '0.6s' }}>
          <h3 className="results-chart-title">Coverage Distribution</h3>
          <Plot
            key={`donut-${theme}-${animatedCoverage.toFixed(1)}-${animatedCovered.toFixed(1)}`}
            data={donutData}
            layout={{...donutLayout, height: 200, margin: { l: 10, r: 10, t: 10, b: 10 }}}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
        </div>

        <div className="results-chart-container animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <h3 className="results-chart-title">Equivalencies</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="results-stat-card text-center relative group">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-help z-20" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)' }}>
                <span className="text-xs" style={{ color: 'var(--primary-green)' }}>ℹ️</span>
              </div>
              <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                <div className="text-xs rounded p-2 shadow-lg max-w-[180px] whitespace-normal" style={{ 
                  backgroundColor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                  color: textColor,
                  backdropFilter: 'blur(10px)'
                }}>
                  Equivalent to removing this many average cars from the road for one year
                </div>
              </div>
              <p className="text-2xl mb-1">🚗</p>
              <p className="results-stat-value text-lg" style={{ color: 'var(--text-primary)' }}>{(results.cars_off_road_equivalent / 1000).toFixed(0)}K</p>
              <p className="results-stat-sub">Cars</p>
            </div>
            <div className="results-stat-card text-center relative group">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-help z-20" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)' }}>
                <span className="text-xs" style={{ color: 'var(--primary-green)' }}>ℹ️</span>
              </div>
              <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                <div className="text-xs rounded p-2 shadow-lg max-w-[180px] whitespace-normal" style={{ 
                  backgroundColor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                  color: textColor,
                  backdropFilter: 'blur(10px)'
                }}>
                  Equivalent to planting this many trees and letting them grow for 10 years
                </div>
              </div>
              <p className="text-2xl mb-1">🌳</p>
              <p className="results-stat-value text-lg" style={{ color: 'var(--text-primary)' }}>{(results.trees_planted_equivalent / 1000000).toFixed(1)}M</p>
              <p className="results-stat-sub">Trees</p>
            </div>
            <div className="results-stat-card text-center relative group">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-help z-20" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)' }}>
                <span className="text-xs" style={{ color: 'var(--primary-green)' }}>ℹ️</span>
              </div>
              <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                <div className="text-xs rounded p-2 shadow-lg max-w-[180px] whitespace-normal" style={{ 
                  backgroundColor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                  color: textColor,
                  backdropFilter: 'blur(10px)'
                }}>
                  Equivalent to closing this many 1GW coal-fired power plants
                </div>
              </div>
              <p className="text-2xl mb-1">⚡</p>
              <p className="results-stat-value text-lg" style={{ color: 'var(--text-primary)' }}>{results.coal_plants_closed_equivalent?.toFixed(2)}</p>
              <p className="results-stat-sub">1GW Coal Plants</p>
            </div>
            <div className="results-stat-card text-center relative group">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-help z-20" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)' }}>
                <span className="text-xs" style={{ color: 'var(--primary-green)' }}>ℹ️</span>
              </div>
              <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                <div className="text-xs rounded p-2 shadow-lg max-w-[180px] whitespace-normal" style={{ 
                  backgroundColor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                  color: textColor,
                  backdropFilter: 'blur(10px)'
                }}>
                  Equivalent to powering this many average homes with clean energy for one year
                </div>
              </div>
              <p className="text-2xl mb-1">🏠</p>
              <p className="results-stat-value text-lg" style={{ color: 'var(--text-primary)' }}>{(results.homes_powered_equivalent / 1000).toFixed(0)}K</p>
              <p className="results-stat-sub">Homes</p>
            </div>
          </div>
          {results.equivalencies_source && (
            <p className="results-context-text text-[10px] mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)'}` }}>
              <span style={{ color: 'var(--text-primary)' }}>Source:</span> {results.equivalencies_source}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
