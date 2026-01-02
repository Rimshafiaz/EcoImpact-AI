import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { predictPolicy } from '../../utils/api/predictions';
import { saveSimulation } from '../../utils/api/simulations';
import { isAuthenticated } from '../../utils/api/auth';
import { useNotificationContext } from '../../App';
import { extractErrorMessage } from '../../utils/errorHandler';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function Simulate() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [inputData, setInputData] = useState(null);

  const handleSubmit = async (formData) => {
    if (!isAuthenticated()) {
      showError('Please sign up or log in to generate simulations');
      navigate('/signup', { state: { from: { pathname: '/simulate' } } });
      return;
    }

    setLoading(true);
    setResults(null);
    setInputData(formData);

    try {
      const predictions = await predictPolicy(formData);
      setResults(predictions);
      
      try {
        await saveSimulation(formData, predictions);
        showSuccess('Simulation completed and saved successfully!', 2000);
      } catch (saveErr) {
        showSuccess('Simulation completed successfully!', 2000);
        showError(extractErrorMessage(saveErr));
      }
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
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
        <div className="w-full">
          <InputForm onSubmit={handleSubmit} loading={loading} hasResults={!!results} />
          {results && <ResultsDisplay results={results} inputData={inputData} />}
        </div>
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
