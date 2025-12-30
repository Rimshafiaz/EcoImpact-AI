export default function RecommendationsSection({ results }) {
  return (
    <div className="bg-[rgba(26,38,30,0.8)] rounded-xl border border-[rgba(0,255,111,0.15)] hover:border-[rgba(0,255,111,0.25)] transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[rgba(0,255,111,0.1)] flex-shrink-0">
        <h2 className="text-[#00FF6F] text-xl font-bold uppercase tracking-wide">Recommendations</h2>
      </div>

      <div className="p-5">
        <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)] mb-4">
          <h3 className="text-gray-300 text-sm font-semibold mb-2">Recommendation</h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-6">
            {results.recommendation}
          </p>
        </div>

        {results.similar_policies && results.similar_policies.length > 0 && (
          <div className="bg-[rgba(10,13,11,0.4)] rounded-lg p-4 border border-[rgba(0,255,111,0.1)]">
            <h3 className="text-gray-300 text-sm font-semibold mb-2">Similar Policies</h3>
            <ul className="space-y-1.5">
              {results.similar_policies.slice(0, 4).map((policy, idx) => (
                <li key={idx} className="text-gray-300 text-xs flex items-start">
                  <span className="text-[#00D9A3] mr-2 mt-1">▸</span>
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
