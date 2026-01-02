import { useEffect, useRef } from 'react';
import ResultsDisplay from '../../simulate/components/ResultsDisplay';
import { exportComparisonToCSV, exportComparisonToPDF } from '../../../utils/export';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';

export default function ComparisonView({ comparisonData, onBack }) {
  const { showError, showSuccess } = useNotificationContext();
  const sim1 = comparisonData.simulation_1;
  const sim2 = comparisonData.simulation_2;
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);

  useEffect(() => {
    if (card1Ref.current) {
      card1Ref.current.style.opacity = '0';
      card1Ref.current.style.transform = 'translateX(-50px)';
      setTimeout(() => {
        card1Ref.current.style.transition = 'all 0.6s ease-out';
        card1Ref.current.style.opacity = '1';
        card1Ref.current.style.transform = 'translateX(0)';
      }, 50);
    }
    if (card2Ref.current) {
      card2Ref.current.style.opacity = '0';
      card2Ref.current.style.transform = 'translateX(50px)';
      setTimeout(() => {
        card2Ref.current.style.transition = 'all 0.6s ease-out';
        card2Ref.current.style.opacity = '1';
        card2Ref.current.style.transform = 'translateX(0)';
      }, 200);
    }
  }, []);

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide">
          Policy Comparison
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              try {
                const sim1Export = {
                  policy_name: sim1.policy_name || 'Policy 1',
                  input_params: sim1.input || sim1.input_params || {},
                  results: sim1.results,
                  created_at: sim1.created_at || new Date().toISOString()
                };
                const sim2Export = {
                  policy_name: sim2.policy_name || 'Policy 2',
                  input_params: sim2.input || sim2.input_params || {},
                  results: sim2.results,
                  created_at: sim2.created_at || new Date().toISOString()
                };
                exportComparisonToCSV(sim1Export, sim2Export);
                showSuccess('CSV exported successfully', 2000);
              } catch (error) {
                showError(extractErrorMessage(error));
              }
            }}
            className="px-4 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors text-sm font-semibold"
          >
            Export Comparison CSV
          </button>
          <button
            onClick={async () => {
              try {
                const sim1Export = {
                  policy_name: sim1.policy_name || 'Policy 1',
                  input_params: sim1.input || sim1.input_params || {},
                  results: sim1.results,
                  created_at: sim1.created_at || new Date().toISOString()
                };
                const sim2Export = {
                  policy_name: sim2.policy_name || 'Policy 2',
                  input_params: sim2.input || sim2.input_params || {},
                  results: sim2.results,
                  created_at: sim2.created_at || new Date().toISOString()
                };
                await exportComparisonToPDF(sim1Export, sim2Export);
                showSuccess('PDF exported successfully', 2000);
              } catch (error) {
                showError(extractErrorMessage(error));
              }
            }}
            className="px-4 py-2 bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.3)] text-[#00FF6F] rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors text-sm font-semibold"
          >
            Export Comparison PDF
          </button>
          <button
            onClick={onBack}
            className="text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
          >
            ← Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div ref={card1Ref}>
          <div className="mb-4 px-4 py-2 bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] rounded-t-lg">
            <h2 className="text-xl font-bold text-[#0A0D0B]">
              {sim1.policy_name || 'Policy 1'}
            </h2>
          </div>
          <div className="bg-[rgba(26,38,30,0.8)] rounded-b-xl border border-[rgba(0,255,111,0.15)] overflow-hidden">
            <ResultsDisplay 
              results={sim1.results} 
              inputData={{
                country: sim1.input?.country || sim1.input_params?.country,
                policyType: sim1.input?.policy_type || sim1.input_params?.policy_type,
                carbonPrice: sim1.input?.carbon_price_usd || sim1.input_params?.carbon_price_usd,
                coverage: sim1.input?.coverage_percent || sim1.input_params?.coverage_percent,
                year: sim1.input?.year || sim1.input_params?.year,
                duration: sim1.input?.projection_years || sim1.input_params?.projection_years
              }}
            />
          </div>
        </div>

        <div ref={card2Ref}>
          <div className="mb-4 px-4 py-2 bg-gradient-to-r from-[#01D6DF] to-[#00FF6F] rounded-t-lg">
            <h2 className="text-xl font-bold text-[#0A0D0B]">
              {sim2.policy_name || 'Policy 2'}
            </h2>
          </div>
          <div className="bg-[rgba(26,38,30,0.8)] rounded-b-xl border border-[rgba(0,255,111,0.15)] overflow-hidden">
            <ResultsDisplay 
              results={sim2.results} 
              inputData={{
                country: sim2.input?.country || sim2.input_params?.country,
                policyType: sim2.input?.policy_type || sim2.input_params?.policy_type,
                carbonPrice: sim2.input?.carbon_price_usd || sim2.input_params?.carbon_price_usd,
                coverage: sim2.input?.coverage_percent || sim2.input_params?.coverage_percent,
                year: sim2.input?.year || sim2.input_params?.year,
                duration: sim2.input?.projection_years || sim2.input_params?.projection_years
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
