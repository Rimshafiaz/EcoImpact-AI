import { useEffect, useRef, useState } from 'react';
import ResultsDisplay from '../../simulate/components/ResultsDisplay';
import { exportComparisonToCSV, exportComparisonToPDF } from '../../../utils/export';
import { useNotificationContext } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { useTheme } from '../../../contexts/ThemeContext';
import { saveComparison } from '../../../utils/api/simulations';

export default function ComparisonView({ comparisonData, onBack, onSaved }) {
  const { showError, showSuccess } = useNotificationContext();
  const { theme } = useTheme();
  const sim1 = comparisonData.simulation_1;
  const sim2 = comparisonData.simulation_2;
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const [saving, setSaving] = useState(false);
  const isDark = theme === 'dark';

  const handleSaveComparison = async () => {
    try {
      setSaving(true);
      console.log('=== SAVING COMPARISON ===');
      console.log('comparisonData:', comparisonData);
      
      if (!comparisonData || !comparisonData.simulation_1 || !comparisonData.simulation_2) {
        throw new Error('Missing comparison data');
      }
      
      const result = await saveComparison(comparisonData);
      console.log('=== SAVE SUCCESS ===', result);
      showSuccess('Comparison saved successfully!', 2000);
      
      // Reload the list immediately
      if (onSaved) {
        console.log('Calling onSaved callback...');
        await onSaved();
        console.log('onSaved callback completed');
      }
    } catch (error) {
      console.error('=== SAVE ERROR ===', error);
      showError(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: 'var(--primary-green)' }}>
          Policy Comparison
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleSaveComparison}
            disabled={saving}
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(45, 122, 79, 0.5)'}`,
              color: 'var(--primary-green)'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)';
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Comparison'}
          </button>
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
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
              color: 'var(--primary-green)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)';
            }}
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
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
              color: 'var(--primary-green)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)';
            }}
          >
            Export Comparison PDF
          </button>
          <button
            onClick={onBack}
            className="transition-colors px-3 py-1 rounded"
            style={{ 
              color: 'var(--primary-green)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--accent-green)';
              e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--primary-green)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div ref={card1Ref} className="min-w-0">
          <div 
            className="mb-4 px-4 py-2 rounded-t-lg"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(135deg, #2D7A4F 0%, #5C9B6F 100%)'
            }}
          >
            <h2 className="text-xl font-bold break-words" style={{ color: isDark ? '#0A0D0B' : '#FFFFFF' }}>
              {sim1.policy_name || 'Policy 1'}
            </h2>
          </div>
          <div 
            className="rounded-b-xl overflow-hidden"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'}`
            }}
          >
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
              isComparison={true}
            />
          </div>
        </div>

        <div ref={card2Ref} className="min-w-0">
          <div 
            className="mb-4 px-4 py-2 rounded-t-lg"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #5C9B6F 0%, #2D7A4F 100%)'
            }}
          >
            <h2 className="text-xl font-bold break-words" style={{ color: isDark ? '#0A0D0B' : '#FFFFFF' }}>
              {sim2.policy_name || 'Policy 2'}
            </h2>
          </div>
          <div 
            className="rounded-b-xl overflow-hidden"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 122, 79, 0.15)'}`
            }}
          >
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
              isComparison={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
