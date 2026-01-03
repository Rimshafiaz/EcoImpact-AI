import Plot from 'react-plotly.js';

export default function RiskSection({ results }) {
  const survivalProbability = 100 - results.abolishment_risk_percent;

  const gaugeData = [{
    type: 'indicator',
    mode: 'gauge+number+delta',
    value: survivalProbability,
    title: { text: 'Survival Probability', font: { color: '#9ca3af', size: 11 } },
    number: { suffix: '%', font: { color: '#00D9A3', size: 32 } },
    gauge: {
      axis: { range: [0, 100], tickwidth: 1, tickcolor: '#9ca3af' },
      bar: { color: '#00D9A3' },
      bgcolor: '#1a4d45',
      borderwidth: 2,
      bordercolor: '#00D9A3',
      steps: [
        { range: [0, 50], color: '#7f1d1d' },
        { range: [50, 75], color: '#854d0e' },
        { range: [75, 100], color: '#14532d' }
      ],
      threshold: {
        line: { color: '#ef4444', width: 4 },
        thickness: 0.75,
        value: 85
      }
    }
  }];

  const gaugeLayout = {
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af', size: 9 },
    margin: { l: 40, r: 40, t: 60, b: 40 },
    height: 300
  };

  const riskFactors = results.key_risks?.map(risk => {
    const severityMatch = risk.match(/\((\d+)%\)/);
    const severity = severityMatch ? parseInt(severityMatch[1]) : 30;
    const riskText = risk.replace(/\s*\(\d+%\)/, '');

    return {
      text: riskText,
      severity: severity,
      level: severity < 30 ? 'Low' : severity < 60 ? 'Medium' : 'High'
    };
  }) || [];

  const riskBarData = [{
    y: riskFactors.map(r => r.text),
    x: riskFactors.map(r => r.severity),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: riskFactors.map(r =>
        r.severity < 30 ? '#00D9A3' : r.severity < 60 ? '#fbbf24' : '#ef4444'
      )
    },
    text: riskFactors.map(r => `${r.severity}% - ${r.level}`),
    textposition: 'outside',
    hovertemplate: '%{y}: %{x}%<extra></extra>'
  }];

  const riskBarLayout = {
    xaxis: {
      title: 'Risk Severity (%)',
      range: [0, 100],
      color: '#9ca3af',
      gridcolor: '#1a4d45'
    },
    yaxis: {
      color: '#9ca3af',
      automargin: true
    },
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af', size: 11 },
    margin: { l: 180, r: 100, t: 20, b: 50 },
    height: Math.max(200, riskFactors.length * 60)
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

      <div className="p-5">
        <div className="mb-5">
          <Plot
            data={gaugeData}
            layout={{...gaugeLayout, height: 200, margin: { l: 30, r: 30, t: 40, b: 30 }}}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
          <div className="text-center mt-2">
            <span className={getBadgeClass()}>
              {results.risk_category}
            </span>
          </div>
        </div>

        <div className="results-context-box">
          <h3 className="results-chart-title">Context</h3>
          <p className="results-context-text">
            {results.context_explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
