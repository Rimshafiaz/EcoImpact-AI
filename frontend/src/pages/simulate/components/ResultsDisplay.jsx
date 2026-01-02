import HeroCards from './HeroCards';
import FinancialSection from './FinancialSection';
import RiskSection from './RiskSection';
import EnvironmentalSection from './EnvironmentalSection';
import ProjectionsSection from './ProjectionsSection';
import RecommendationsSection from './RecommendationsSection';

export default function ResultsDisplay({ results, inputData }) {
  if (!results) return null;

  return (
    <div className="mt-12 w-full max-w-7xl mx-auto min-w-0">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-[#00FF6F] text-3xl md:text-4xl font-bold mb-3 uppercase tracking-wide">
          Simulation Results
        </h2>
        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {inputData?.country || 'N/A'}
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {inputData?.policyType || 'N/A'}
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            ${inputData?.carbonPrice || 'N/A'}/tonne
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {inputData?.coverage || 'N/A'}% coverage
          </span>
          <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
            {inputData?.duration || 'N/A'} years
          </span>
        </div>
      </div>

      {/* Hero Summary Cards - Compact */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <HeroCards results={results} />
      </div>

      {/* Main Content Grid - 2 Columns on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
        {/* Left Column */}
        <div className="flex flex-col space-y-6">
          {/* Financial Analysis - Compact */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <FinancialSection results={results} />
          </div>

          <div className="animate-fade-in-up flex-1" style={{ animationDelay: '0.3s' }}>
            <RiskSection results={results} />
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <EnvironmentalSection results={results} />
          </div>

          <div className="animate-fade-in-up flex-1" style={{ animationDelay: '0.5s' }}>
            <RecommendationsSection results={results} />
          </div>
        </div>
      </div>
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <ProjectionsSection results={results} />
      </div>
    </div>
  );
}
