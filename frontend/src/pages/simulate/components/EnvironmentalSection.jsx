import Plot from 'react-plotly.js';

export default function EnvironmentalSection({ results }) {
  const coveragePercent = ((results.co2_covered_mt / results.total_country_co2_mt) * 100).toFixed(1);
  const uncoveredPercent = (100 - coveragePercent).toFixed(1);

  const donutData = [{
    values: [results.co2_covered_mt, results.total_country_co2_mt - results.co2_covered_mt],
    labels: ['Covered', 'Not Covered'],
    type: 'pie',
    hole: 0.6,
    marker: {
      colors: ['#00D9A3', '#1a4d45']
    },
    textinfo: 'label+percent',
    textfont: { color: '#ffffff' },
    hovertemplate: '%{label}: %{value:.2f}M tonnes<extra></extra>'
  }];

  const donutLayout = {
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af', size: 9 },
    margin: { l: 20, r: 20, t: 20, b: 20 },
    height: 300,
    showlegend: true,
    legend: {
      x: 0.5,
      xanchor: 'center',
      y: -0.1,
      orientation: 'h',
      bgcolor: '#0d2a26',
      bordercolor: '#1a4d45',
      borderwidth: 1,
      font: { size: 9 }
    },
    annotations: [{
      text: `${coveragePercent}%`,
      x: 0.5,
      y: 0.5,
      font: { size: 22, color: '#00D9A3' },
      showarrow: false
    }]
  };

  const funnelData = [{
    y: ['Total Country Emissions', 'Covered by Policy', 'Potential Reduction'],
    x: [results.total_country_co2_mt, results.co2_covered_mt, results.co2_reduced_mt],
    type: 'funnel',
    marker: {
      color: ['#1a4d45', '#00D9A3', '#00f5c3']
    },
    textinfo: 'value+percent initial',
    textfont: { color: '#ffffff' },
    hovertemplate: '%{y}: %{x:.2f}M tonnes<extra></extra>'
  }];

  const funnelLayout = {
    paper_bgcolor: '#0a1f1c',
    plot_bgcolor: '#0a1f1c',
    font: { color: '#9ca3af' },
    margin: { l: 200, r: 50, t: 20, b: 50 },
    height: 250
  };

  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)]">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Environmental Impact</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-3 border border-[rgba(0,255,111,0.1)]">
            <p className="text-gray-400 text-[10px] uppercase mb-1">Total CO2</p>
            <p className="text-white text-xl font-bold">{results.total_country_co2_mt?.toFixed(1)}M</p>
            <p className="text-gray-500 text-[10px]">tonnes</p>
          </div>
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-3 border border-[rgba(0,255,111,0.1)]">
            <p className="text-gray-400 text-[10px] uppercase mb-1">Covered</p>
            <p className="text-[#00D9A3] text-xl font-bold">{results.co2_covered_mt?.toFixed(1)}M</p>
            <p className="text-gray-500 text-[10px]">{coveragePercent}%</p>
          </div>
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-3 border border-[rgba(0,255,111,0.1)]">
            <p className="text-gray-400 text-[10px] uppercase mb-1">Reduced</p>
            <p className="text-[#00f5c3] text-xl font-bold">{results.co2_reduced_mt?.toFixed(2)}M</p>
            <p className="text-gray-500 text-[10px]">per year</p>
          </div>
          <div className="bg-[rgba(10,13,11,0.6)] rounded-lg p-3 border border-[rgba(0,255,111,0.1)]">
            <p className="text-gray-400 text-[10px] uppercase mb-1">Per Capita</p>
            <p className="text-white text-xl font-bold">{results.co2_covered_per_capita_tonnes?.toFixed(2)}</p>
            <p className="text-gray-500 text-[10px]">tonnes</p>
          </div>
        </div>

        <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)] mb-5">
          <h3 className="text-gray-300 text-sm font-semibold mb-3">Coverage Distribution</h3>
          <Plot
            data={donutData}
            layout={{...donutLayout, height: 200, margin: { l: 10, r: 10, t: 10, b: 10 }}}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
        </div>

        <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
          <h3 className="text-gray-300 text-sm font-semibold mb-3">Equivalencies</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-3 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(0,255,111,0.05)]">
              <p className="text-2xl mb-1">🚗</p>
              <p className="text-white text-lg font-bold">{(results.cars_off_road_equivalent / 1000).toFixed(0)}K</p>
              <p className="text-gray-400 text-[10px]">Cars</p>
            </div>
            <div className="text-center p-3 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(0,255,111,0.05)]">
              <p className="text-2xl mb-1">🌳</p>
              <p className="text-white text-lg font-bold">{(results.trees_planted_equivalent / 1000000).toFixed(1)}M</p>
              <p className="text-gray-400 text-[10px]">Trees</p>
            </div>
            <div className="text-center p-3 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(0,255,111,0.05)]">
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-white text-lg font-bold">{results.coal_plants_closed_equivalent?.toFixed(2)}</p>
              <p className="text-gray-400 text-[10px]">1GW Coal Plants</p>
            </div>
            <div className="text-center p-3 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(0,255,111,0.05)]">
              <p className="text-2xl mb-1">🏠</p>
              <p className="text-white text-lg font-bold">{(results.homes_powered_equivalent / 1000).toFixed(0)}K</p>
              <p className="text-gray-400 text-[10px]">Homes</p>
            </div>
          </div>
          {results.equivalencies_source && (
            <p className="text-gray-400 text-[10px] mt-3 pt-3 border-t border-[rgba(0,255,111,0.1)]">
              <span className="text-gray-300">Source:</span> {results.equivalencies_source}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
