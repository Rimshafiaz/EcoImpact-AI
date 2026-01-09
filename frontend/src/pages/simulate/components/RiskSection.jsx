import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../../../contexts/ThemeContext';

export default function RiskSection({ results }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const [animatedValue, setAnimatedValue] = useState(0);
  const survivalProbability = 100 - results.abolishment_risk_percent;

  // Animate the gauge value
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = survivalProbability;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedValue(endValue);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 800); // Start after scroll

    return () => clearTimeout(timer);
  }, [survivalProbability]);

  const primaryColor = isDark ? '#10B981' : '#2D7A4F';
  const accentColor = isDark ? '#34D399' : '#4FB37A';
  const textColor = isDark ? '#CBD5E1' : '#5C4E3D';
  const bgColor = isDark ? '#0a1f1c' : 'transparent';

  const gaugeData = [{
    type: 'indicator',
    mode: 'gauge+number+delta',
    value: animatedValue,
    title: { text: 'Survival Probability', font: { color: textColor, size: 11 } },
    number: { suffix: '%', font: { color: accentColor, size: 32 } },
    gauge: {
      axis: { range: [0, 100], tickwidth: 1, tickcolor: textColor },
      bar: { color: accentColor },
      bgcolor: isDark ? '#1a4d45' : 'rgba(229, 231, 235, 0.5)',
      borderwidth: 2,
      bordercolor: accentColor,
      steps: [
        { range: [0, 50], color: '#7f1d1d' },
        { range: [50, 75], color: '#854d0e' },
        { range: [75, 100], color: isDark ? '#14532d' : '#D1FAE5' }
      ],
      threshold: {
        line: { color: '#ef4444', width: 4 },
        thickness: 0.75,
        value: 85
      }
    }
  }];

  const gaugeLayout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { color: textColor, size: 9 },
    margin: { l: 40, r: 40, t: 60, b: 40 },
    height: 300
  };

  const getBadgeClass = () => {
    if (results.risk_category === 'Low Risk') return 'results-badge results-badge-low';
    if (results.risk_category === 'At Risk') return 'results-badge results-badge-medium';
    return 'results-badge results-badge-high';
  };

  return (
    <div className="results-section h-full flex flex-col">
      <div className="results-section-header flex-shrink-0">
        <h2 className="results-section-title">Risk Assessment</h2>
      </div>

      <div className="px-5 pt-5 flex flex-col" style={{ paddingBottom: '1rem' }}>
        <div className="animate-scale-in" style={{ marginBottom: '3rem', animationDelay: '0.3s' }}>
          <Plot
            key={`gauge-${theme}-${animatedValue.toFixed(1)}`}
            data={gaugeData}
            layout={{...gaugeLayout, height: 200, margin: { l: 30, r: 30, t: 40, b: 30 }}}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full animate-chart-reveal"
          />
          <div className="text-center mt-2">
            <span className={getBadgeClass()}>
              {results.risk_category}
            </span>
          </div>
        </div>

        <div className="results-context-box py-10 animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="results-chart-title">Context</h3>
          <p className="results-context-text">
            {results.context_explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
