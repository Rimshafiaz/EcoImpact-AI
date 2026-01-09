import { useState, useRef, useEffect } from 'react';
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
  const resultsRef = useRef(null);

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

  // Auto-scroll to results when they're loaded
  useEffect(() => {
    if (results && resultsRef.current && isAuthenticated()) {
      // Wait a bit for DOM to render, then scroll
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [results]);

  return (
    <div className="simulate-page">
      <div className="simulate-page-background"></div>
      <div className="cyber-earth-container">
        <img
          src={cyberEarthImage}
          alt="Cyber Earth"
          className="cyber-earth-image"
          style={{ animation: 'rotateEarth 30s linear infinite' }}
        />
      </div>

      <div className="simulate-content">
        <div className="w-full">
          <InputForm onSubmit={handleSubmit} loading={loading} hasResults={!!results} />
          {results && (
            <div ref={resultsRef}>
              <ResultsDisplay results={results} inputData={inputData} />
            </div>
          )}
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
