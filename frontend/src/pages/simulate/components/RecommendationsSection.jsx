export default function RecommendationsSection({ results }) {
  return (
    <div className="results-section h-full flex flex-col">
      <div className="results-section-header flex-shrink-0">
        <h2 className="results-section-title">Recommendations</h2>
      </div>

      <div className="p-5">
        <div className="results-context-box mb-4 animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="results-chart-title">Recommendation</h3>
          <p className="results-context-text text-xs line-clamp-6">
            {results.recommendation}
          </p>
        </div>

        {results.similar_policies && results.similar_policies.length > 0 && (
          <div className="results-context-box animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="results-chart-title">Similar Policies</h3>
            <ul className="space-y-1.5">
              {results.similar_policies.slice(0, 4).map((policy, idx) => (
                <li key={idx} className="results-context-text text-xs flex items-start animate-fade-in" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>
                  <span style={{ color: 'var(--primary-green)' }} className="mr-2 mt-1">▸</span>
                  <span className="line-clamp-2">{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
