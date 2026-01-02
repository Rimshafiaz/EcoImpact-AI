import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, getSimulationById, deleteSimulation, updateSimulationName } from '../../utils/api/simulations';
import { isAuthenticated } from '../../utils/api/auth';
import { useNotificationContext } from '../../App';
import { extractErrorMessage } from '../../utils/errorHandler';
import SimulationList from './components/SimulationList';
import SimulationDetail from './components/SimulationDetail';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function History() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotificationContext();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
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
      showError(extractErrorMessage(err));
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
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSimulation(null);
  };

  const handleDelete = async (simulationId) => {
    try {
      await deleteSimulation(simulationId);
      await loadSimulations();
      if (selectedSimulation && selectedSimulation.id === simulationId) {
        setSelectedSimulation(null);
      }
      showSuccess('Simulation deleted successfully', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const handleEditName = async (simulationId, newName) => {
    try {
      await updateSimulationName(simulationId, newName);
      await loadSimulations();
      if (selectedSimulation && selectedSimulation.id === simulationId) {
        const updated = await getSimulationById(simulationId);
        setSelectedSimulation(updated);
      }
      showSuccess('Simulation name updated successfully', 2000);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
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
        {selectedSimulation ? (
          <SimulationDetail
            simulation={selectedSimulation}
            onBack={handleBackToList}
            onUpdate={async () => {
              const updated = await getSimulationById(selectedSimulation.id);
              setSelectedSimulation(updated);
              await loadSimulations();
            }}
          />
        ) : (
          <SimulationList
            simulations={filteredSimulations}
            allSimulations={simulations}
            loading={loading}
            onSimulationClick={handleSimulationClick}
            onRefresh={loadSimulations}
            onDelete={handleDelete}
            onEditName={handleEditName}
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

