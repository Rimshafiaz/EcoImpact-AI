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

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)] flex-shrink-0">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Risk Assessment</h2>
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
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
              results.risk_category === 'Low Risk' ? 'bg-green-900 text-green-400' :
              results.risk_category === 'At Risk' ? 'bg-yellow-900 text-yellow-400' :
              'bg-red-900 text-red-400'
            }`}>
              {results.risk_category}
            </span>
          </div>
        </div>

        <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
          <h3 className="text-gray-300 text-sm font-semibold mb-3">Context</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {results.context_explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
