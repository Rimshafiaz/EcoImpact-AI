import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, getSimulationById } from '../../utils/api/simulations';
import { isAuthenticated } from '../../utils/api/auth';
import SimulationList from './components/SimulationList';
import SimulationDetail from './components/SimulationDetail';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function History() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterPolicyType, setFilterPolicyType] = useState('');

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
      setLoading(true);
      const sim = await getSimulationById(simulationId);
      setSelectedSimulation(sim);
    } catch (err) {
      setError(err.message || 'Failed to load simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSimulation(null);
  };

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = !searchTerm || 
      sim.policy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || sim.country === filterCountry;
    const matchesPolicyType = !filterPolicyType || sim.policy_type === filterPolicyType;
    
    return matchesSearch && matchesCountry && matchesPolicyType;
  });

  const uniqueCountries = [...new Set(simulations.map(sim => sim.country))].sort();
  const uniquePolicyTypes = [...new Set(simulations.map(sim => sim.policy_type))].sort();

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

        {selectedSimulation ? (
          <SimulationDetail
            simulation={selectedSimulation}
            onBack={handleBackToList}
          />
        ) : (
          <SimulationList
            simulations={filteredSimulations}
            allSimulations={simulations}
            loading={loading}
            onSimulationClick={handleSimulationClick}
            onRefresh={loadSimulations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCountry={filterCountry}
            onFilterCountryChange={setFilterCountry}
            filterPolicyType={filterPolicyType}
            onFilterPolicyTypeChange={setFilterPolicyType}
            uniqueCountries={uniqueCountries}
            uniquePolicyTypes={uniquePolicyTypes}
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

