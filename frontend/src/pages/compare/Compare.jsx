import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, compareSimulations, getSimulationById, deleteSimulation, getUserComparisons, getComparisonById, deleteComparison } from '../../utils/api/simulations';
import { isAuthenticated } from '../../utils/api/auth';
import { exportToCSV, exportToPDF } from '../../utils/export';
import { useNotificationContext } from '../../App';
import { extractErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../contexts/ThemeContext';
import SimulationList from './components/SimulationList';
import ComparisonView from './components/ComparisonView';
import NewComparisonForm from './components/NewComparisonForm';
import ResultsDisplay from '../simulate/components/ResultsDisplay';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function Compare() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotificationContext();
  const { theme } = useTheme();
  const [simulations, setSimulations] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); 
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [showNewComparison, setShowNewComparison] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadSimulations();
    loadSavedComparisons();
  }, [navigate]);

  useEffect(() => {
    if (viewMode === 'saved') {
      loadSavedComparisons();
    }
  }, [viewMode]);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      const data = await getUserSimulations();
      setSimulations(data);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadSavedComparisons = async () => {
    try {
      console.log('Loading saved comparisons...');
      const data = await getUserComparisons();
      console.log('Loaded comparisons:', data);
      setSavedComparisons(data || []);
    } catch (err) {
      console.error('Failed to load comparisons:', err);
      const errorMsg = extractErrorMessage(err);
      if (!errorMsg.includes('unable to parse string as an integer')) {
        showError(errorMsg);
      }
      setSavedComparisons([]);
    }
  };

  const handleSimulationClick = async (simulationId) => {
    try {
      setLoading(true);
      const sim = await getSimulationById(simulationId);
      setSelectedSimulation(sim);
      setViewMode('detail');
      setComparisonData(null);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCompareTwo = async (simId1, simId2) => {
    try {
      setLoading(true);
      const data = await compareSimulations({
        simulationId1: simId1,
        simulationId2: simId2
      });
      setComparisonData(data);
      setViewMode('compare');
      setSelectedSimulation(null);
      showSuccess('Comparison loaded successfully!', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleNewComparison = async (sim1Data, sim2Data) => {
    try {
      setLoading(true);
      const data = await compareSimulations({
        newSimulation1: sim1Data,
        newSimulation2: sim2Data
      });
      setComparisonData(data);
      setViewMode('compare');
      setShowNewComparison(false);
      setSelectedSimulation(null);
      showSuccess('Comparison generated successfully!', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSimulation(null);
    setComparisonData(null);
    setShowNewComparison(false);
  };

  const handleLoadSavedComparison = async (comparisonId) => {
    try {
      setLoading(true);
      const data = await getComparisonById(comparisonId);
      setComparisonData({
        simulation_1: data.simulation_1_data,
        simulation_2: data.simulation_2_data
      });
      setViewMode('compare');
      setSelectedSimulation(null);
      showSuccess('Comparison loaded successfully!', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComparison = async (comparisonId) => {
    try {
      await deleteComparison(comparisonId);
      await loadSavedComparisons();
      showSuccess('Comparison deleted successfully', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const handleComparisonSaved = async () => {
    console.log('Comparison saved callback triggered, reloading comparisons...');
    try {
      const data = await getUserComparisons();
      console.log('Loaded comparisons after save:', data);
      setSavedComparisons(data || []);
      console.log('State updated with', data?.length || 0, 'comparisons');
    } catch (err) {
      console.error('Failed to reload comparisons:', err);
      const errorMsg = extractErrorMessage(err);
      if (!errorMsg.includes('unable to parse string as an integer')) {
        showError(errorMsg);
      }
    }
  };

  const handleDelete = async (simulationId) => {
    try {
      await deleteSimulation(simulationId);
      await loadSimulations();
      if (selectedSimulation && selectedSimulation.id === simulationId) {
        setSelectedSimulation(null);
        setViewMode('list');
      }
      showSuccess('Simulation deleted successfully', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] md:bottom-[-100px] md:right-[-100px] md:w-[500px] md:h-[500px] lg:bottom-[-150px] lg:right-[-150px] lg:w-[700px] lg:h-[700px] pointer-events-none z-0 overflow-hidden">
        <img 
          src={cyberEarthImage} 
          alt="Cyber Earth" 
          className="w-full h-full object-contain cyber-earth-image"
          style={{ animation: 'rotateEarth 30s linear infinite' }}
        />
      </div>

      <div className="relative z-10 w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16 xl:py-20">
        {viewMode === 'list' && !showNewComparison && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: 'var(--primary-green)' }}>
                Compare Simulations
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('saved')}
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
                  Saved Comparisons ({savedComparisons.length})
                </button>
              </div>
            </div>
            <SimulationList
              simulations={simulations}
              loading={loading}
              onSimulationClick={handleSimulationClick}
              onCompareTwo={handleCompareTwo}
              onNewComparison={() => setShowNewComparison(true)}
              onRefresh={loadSimulations}
              onDelete={handleDelete}
            />
          </div>
        )}

        {showNewComparison && (
          <NewComparisonForm
            onCompare={handleNewComparison}
            onCancel={() => setShowNewComparison(false)}
            loading={loading}
          />
        )}

        {viewMode === 'detail' && selectedSimulation && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackToList}
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
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    try {
                      exportToCSV(selectedSimulation);
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
                  Export CSV
                </button>
                <button
                  onClick={async () => {
                    try {
                      await exportToPDF(selectedSimulation);
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
                  Export PDF
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--primary-green)' }}>
                {selectedSimulation.policy_name || 'Simulation Details'}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="px-3 py-1 rounded-full border" style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
                }}>
                  {selectedSimulation.input_params?.country || 'N/A'}
                </span>
                <span className="px-3 py-1 rounded-full border" style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
                }}>
                  {selectedSimulation.input_params?.policy_type || 'N/A'}
                </span>
                <span className="px-3 py-1 rounded-full border" style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
                }}>
                  ${selectedSimulation.input_params?.carbon_price_usd || 'N/A'}/tonne
                </span>
                <span className="px-3 py-1 rounded-full border" style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
                }}>
                  {selectedSimulation.input_params?.coverage_percent || 'N/A'}% coverage
                </span>
                <span className="px-3 py-1 rounded-full border" style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)'
                }}>
                  {selectedSimulation.input_params?.projection_years || 'N/A'} years
                </span>
              </div>
            </div>
            <ResultsDisplay 
              results={selectedSimulation.results}
              inputData={{
                country: selectedSimulation.input_params?.country,
                policyType: selectedSimulation.input_params?.policy_type,
                carbonPrice: selectedSimulation.input_params?.carbon_price_usd,
                coverage: selectedSimulation.input_params?.coverage_percent,
                year: selectedSimulation.input_params?.year,
                duration: selectedSimulation.input_params?.projection_years
              }}
            />
          </div>
        )}

        {viewMode === 'saved' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: 'var(--primary-green)' }}>
                Saved Comparisons
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={loadSavedComparisons}
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
                  Refresh
                </button>
                <button
                  onClick={() => setViewMode('list')}
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
                  ← Back to Simulations
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                Loading...
              </div>
            ) : savedComparisons.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                <p className="text-lg mb-4">No saved comparisons yet.</p>
                <p className="text-sm">Create a comparison and save it to view it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedComparisons.map((comparison) => (
                  <div
                    key={comparison.id}
                    className="rounded-lg p-6 cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-card)',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`
                    }}
                    onClick={() => handleLoadSavedComparison(comparison.id)}
                  >
                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                      {comparison.comparison_name || 'Unnamed Comparison'}
                    </h3>
                    <div className="space-y-3 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      <div className="p-3 rounded" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)' }}>
                        <div className="font-semibold mb-1" style={{ color: 'var(--primary-green)' }}>Policy 1</div>
                        <div>{comparison.policy_1_name}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{comparison.country_1}</div>
                      </div>
                      <div className="p-3 rounded" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)' }}>
                        <div className="font-semibold mb-1" style={{ color: 'var(--primary-green)' }}>Policy 2</div>
                        <div>{comparison.policy_2_name}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{comparison.country_2}</div>
                      </div>
                      <div className="text-xs pt-2" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(comparison.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSavedComparison(comparison.id);
                        }}
                        className="flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)',
                          color: 'var(--primary-green)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 122, 79, 0.2)';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this comparison?')) {
                            handleDeleteComparison(comparison.id);
                          }
                        }}
                        className="px-3 py-2 rounded text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                          color: isDark ? '#FCA5A5' : '#DC2626'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.2)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'compare' && comparisonData && (
          <ComparisonView
            comparisonData={comparisonData}
            onBack={handleBackToList}
            onSaved={handleComparisonSaved}
          />
        )}
      </div>

      <style>{`
        @keyframes rotateEarth {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

