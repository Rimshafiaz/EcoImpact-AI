import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, compareSimulations, getSimulationById, deleteSimulation } from '../../utils/api/simulations';
import { isAuthenticated } from '../../utils/api/auth';
import SimulationList from './components/SimulationList';
import ComparisonView from './components/ComparisonView';
import NewComparisonForm from './components/NewComparisonForm';
import ResultsDisplay from '../simulate/components/ResultsDisplay';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function Compare() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [showNewComparison, setShowNewComparison] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadSimulations();
  }, [navigate]);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      const data = await getUserSimulations();
      setSimulations(data);
    } catch (err) {
      setError(err.message || 'Failed to load simulations');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulationClick = async (simulationId) => {
    try {
      const sim = await getSimulationById(simulationId);
      setSelectedSimulation(sim);
      setViewMode('detail');
      setComparisonData(null);
    } catch (err) {
      setError(err.message || 'Failed to load simulation');
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
    } catch (err) {
      setError(err.message || 'Failed to compare simulations');
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
    } catch (err) {
      setError(err.message || 'Failed to compare simulations');
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

  const handleDelete = async (simulationId) => {
    try {
      await deleteSimulation(simulationId);
      await loadSimulations();
      if (selectedSimulation && selectedSimulation.id === simulationId) {
        setSelectedSimulation(null);
        setViewMode('list');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete simulation');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0A0D0B] overflow-hidden">
      <div className="fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] md:bottom-[-100px] md:right-[-100px] md:w-[500px] md:h-[500px] lg:bottom-[-150px] lg:right-[-150px] lg:w-[700px] lg:h-[700px] pointer-events-none z-0 overflow-hidden">
        <img 
          src={cyberEarthImage} 
          alt="Cyber Earth" 
          className="w-full h-full object-contain opacity-60 drop-shadow-[0_0_40px_rgba(0,255,111,0.4)]"
          style={{ animation: 'rotateEarth 30s linear infinite' }}
        />
      </div>

      <div className="relative z-10 w-full h-full overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16 xl:py-20">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 text-center max-w-4xl mx-auto">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {viewMode === 'list' && !showNewComparison && (
          <SimulationList
            simulations={simulations}
            loading={loading}
            onSimulationClick={handleSimulationClick}
            onCompareTwo={handleCompareTwo}
            onNewComparison={() => setShowNewComparison(true)}
            onRefresh={loadSimulations}
            onDelete={handleDelete}
          />
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
            <button
              onClick={handleBackToList}
              className="mb-6 text-[#00FF6F] hover:text-[#01D6DF] transition-colors"
            >
              ← Back to List
            </button>
            <div className="mb-8">
              <h1 className="text-[#00FF6F] text-4xl font-bold uppercase tracking-wide mb-4">
                {selectedSimulation.policy_name || 'Simulation Details'}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
                  {selectedSimulation.input_params?.country || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
                  {selectedSimulation.input_params?.policy_type || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
                  ${selectedSimulation.input_params?.carbon_price_usd || 'N/A'}/tonne
                </span>
                <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
                  {selectedSimulation.input_params?.coverage_percent || 'N/A'}% coverage
                </span>
                <span className="px-3 py-1 bg-[rgba(0,255,111,0.1)] rounded-full border border-[rgba(0,255,111,0.2)]">
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

        {viewMode === 'compare' && comparisonData && (
          <ComparisonView
            comparisonData={comparisonData}
            onBack={handleBackToList}
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

