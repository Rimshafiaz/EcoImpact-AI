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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, comparisonId: null, comparisonName: '' });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadSimulations();
    loadSavedComparisons();
  }, [navigate]);


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
      console.log('Number of comparisons:', data?.length || 0);
      if (data && Array.isArray(data)) {
        setSavedComparisons(data);
        console.log('State updated with', data.length, 'comparisons');
      } else {
        console.warn('Invalid data format received:', data);
        setSavedComparisons([]);
      }
    } catch (err) {
      console.error('Failed to load comparisons:', err);
      console.error('Error details:', err);
      const errorMsg = extractErrorMessage(err);
      console.error('Error message:', errorMsg);
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

  const handleBackToList = async () => {
    setViewMode('list');
    setSelectedSimulation(null);
    setComparisonData(null);
    setShowNewComparison(false);
    await loadSavedComparisons();
  };

  const handleLoadSavedComparison = async (comparison) => {
    try {
      setLoading(true);
      // Re-run the comparison with the saved input parameters
      const data = await compareSimulations({
        newSimulation1: {
          country: comparison.policy_1_input.country,
          policyType: comparison.policy_1_input.policy_type,
          carbonPrice: comparison.policy_1_input.carbon_price_usd,
          coverage: comparison.policy_1_input.coverage_percent,
          year: comparison.policy_1_input.year || 2025,
          duration: comparison.policy_1_input.projection_years || 5
        },
        newSimulation2: {
          country: comparison.policy_2_input.country,
          policyType: comparison.policy_2_input.policy_type,
          carbonPrice: comparison.policy_2_input.carbon_price_usd,
          coverage: comparison.policy_2_input.coverage_percent,
          year: comparison.policy_2_input.year || 2025,
          duration: comparison.policy_2_input.projection_years || 5
        }
      });
      setComparisonData(data);
      setViewMode('compare');
      setSelectedSimulation(null);
      setShowNewComparison(false);
      showSuccess('Comparison loaded successfully!', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComparison = async () => {
    try {
      await deleteComparison(deleteConfirmModal.comparisonId);
      await loadSavedComparisons();
      showSuccess('Comparison deleted successfully', 2000);
      setDeleteConfirmModal({ show: false, comparisonId: null, comparisonName: '' });
    } catch (err) {
      showError(extractErrorMessage(err));
      setDeleteConfirmModal({ show: false, comparisonId: null, comparisonName: '' });
    }
  };

  const handleComparisonSaved = async () => {
    console.log('handleComparisonSaved called - reloading comparisons...');
    await loadSavedComparisons();
    console.log('Comparisons reloaded, current count:', savedComparisons.length);
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
                  onClick={async () => {
                    console.log('Saved Comparisons button clicked');
                    await loadSavedComparisons();
                    setViewMode('saved');
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
                    onClick={() => handleLoadSavedComparison(comparison)}
                  >
                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                      {comparison.comparison_name}
                    </h3>
                    <div className="space-y-3 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      <div className="p-3 rounded" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)' }}>
                        <div className="font-semibold mb-2" style={{ color: 'var(--primary-green)' }}>Policy 1: {comparison.policy_1_name}</div>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Country:</span> {comparison.policy_1_input?.country || 'N/A'}</div>
                          <div><span className="font-medium">Type:</span> {comparison.policy_1_input?.policy_type || 'N/A'}</div>
                          <div><span className="font-medium">Price:</span> ${comparison.policy_1_input?.carbon_price_usd || 0}/tonne</div>
                          <div><span className="font-medium">Coverage:</span> {comparison.policy_1_input?.coverage_percent || 0}%</div>
                        </div>
                      </div>
                      <div className="p-3 rounded" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)' }}>
                        <div className="font-semibold mb-2" style={{ color: 'var(--primary-green)' }}>Policy 2: {comparison.policy_2_name}</div>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Country:</span> {comparison.policy_2_input?.country || 'N/A'}</div>
                          <div><span className="font-medium">Type:</span> {comparison.policy_2_input?.policy_type || 'N/A'}</div>
                          <div><span className="font-medium">Price:</span> ${comparison.policy_2_input?.carbon_price_usd || 0}/tonne</div>
                          <div><span className="font-medium">Coverage:</span> {comparison.policy_2_input?.coverage_percent || 0}%</div>
                        </div>
                      </div>
                      <div className="text-xs pt-2" style={{ color: 'var(--text-tertiary)' }}>
                        {comparison.created_at ? new Date(comparison.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSavedComparison(comparison);
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
                          setDeleteConfirmModal({
                            show: true,
                            comparisonId: comparison.id,
                            comparisonName: comparison.comparison_name
                          });
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

      {deleteConfirmModal.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setDeleteConfirmModal({ show: false, comparisonId: null, comparisonName: '' })}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full shadow-2xl"
            style={{
              backgroundColor: isDark ? 'rgba(26, 38, 30, 0.95)' : 'var(--bg-card)',
              border: `2px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.2)'
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke={isDark ? '#FCA5A5' : '#DC2626'}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Delete Comparison
              </h3>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--primary-green)' }}>"{deleteConfirmModal.comparisonName}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ show: false, comparisonId: null, comparisonName: '' })}
                className="flex-1 px-4 py-2 rounded-lg transition-colors font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-secondary)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(45, 122, 79, 0.3)'}`,
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 122, 79, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isDark ? 'rgba(26, 38, 30, 0.8)' : 'var(--bg-secondary)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComparison}
                className="flex-1 px-4 py-2 rounded-lg transition-colors font-semibold"
                style={{
                  backgroundColor: isDark ? '#DC2626' : '#DC2626',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDark ? '#B91C1C' : '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#DC2626';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rotateEarth {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

