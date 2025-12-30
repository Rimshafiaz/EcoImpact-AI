import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { predictPolicy } from '../../utils/api/predictions';
import cyberEarthImage from '../../assets/cyberearth.png';

export default function Simulate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setInputData(formData);

    try {
      const predictions = await predictPolicy(formData);
      setResults(predictions);
    } catch (err) {
      setError(err.message || 'Failed to generate predictions');
      console.error('Prediction error:', err);
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

          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4 text-center max-w-4xl mx-auto">
              <p className="text-red-400">{error}</p>
            </div>
          )}

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
