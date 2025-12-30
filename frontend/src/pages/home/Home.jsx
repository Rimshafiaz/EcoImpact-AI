import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import earthImage from '../../assets/earth.png';
import '../../index.css';

export default function Home() {
  const [currentWord, setCurrentWord] = useState(0);
  const navigate = useNavigate();
  
  const words = ['FUTURE', 'مستقبل', '未来'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const animationLines = [
    'Revenue Projections',
    'CO2 Reduction Potential',
    'Policy Risk Assessment',
    'Environmental Impact'
  ];

  const cards = [
    {
      heading: 'Set Your Climate Strategy',
      text: 'Adjust key policy parameters like carbon price, coverage, and duration using intuitive sliders and dropdowns.'
    },
    {
      heading: 'Let the AI Forecast the Future',
      text: 'Our machine learning models process your inputs to simulate real-time climate and economic outcomes, from CO2 reduction to revenue predictions.'
    },
    {
      heading: 'View Interactive Results',
      text: 'See your policy\'s results through dynamic graphs showing emissions, revenue, and risk trends, all in one interactive dashboard.'
    }
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-background">
          <div className="hero-radial-gradient"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-main">
            <h1 className="hero-title">
              <span className="hero-title-fixed">MODEL THE</span>{' '}
              <span className="hero-title-animated">
                {words[currentWord]}
              </span>
            </h1>
            <p className="hero-subtitle">Simulate Climate Policies Today</p>
            
            <div className="hero-bottom">
              <div className="hero-left">
                <div className="animation-lines-container">
                  <div className="animation-lines">
                    {animationLines.map((line, index) => (
                      <div 
                        key={`line-${index}`} 
                        className="animation-line"
                      >
                        {line}
                      </div>
                    ))}
                    {animationLines.map((line, index) => (
                      <div 
                        key={`line-duplicate-${index}`} 
                        className="animation-line"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="hero-right">
                <p className="hero-description">
                  An AI-powered simulator for evaluating environmental and economic policy impacts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="how-it-works-background">
          <div className="dots-pattern"></div>
        </div>
        <div className="how-it-works-content">
          <h2 className="how-it-works-title">How it Works</h2>
          <div className="cards-container">
            {cards.map((card, index) => (
              <div key={index} className="how-it-works-card">
                <h3 className="card-heading">{card.heading}</h3>
                <p className="card-text">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="our-mission">
        <div className="our-mission-background">
          <div className="our-mission-dots-pattern"></div>
        </div>
        <div className="our-mission-content">
          <div className="earth-container">
            <img src={earthImage} alt="Earth" className="earth-image" />
          </div>
          <div className="mission-text-container">
            <h2 className="mission-title">Our Mission</h2>
            <div className="mission-text">
              <p>
                We believe data can empower humanity to act smarter against climate change. 
                Our mission is to bridge the gap between complex climate science and practical 
                decision-making through the power of artificial intelligence.
              </p>
              <p>
                By transforming raw environmental and economic data into interactive simulations, 
                Eco-Impact AI enables policymakers, researchers, and communities to explore the 
                real-world outcomes of their climate strategies before they're implemented.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3 className="footer-title">Join the Movement Toward Data-Driven Climate Action</h3>
            <p className="footer-subtitle">
              Simulate smarter policies, visualize their impact, and take meaningful steps toward a sustainable future.
            </p>
            <button className="footer-button" onClick={() => navigate('/simulate')}>Start Simulation</button>
          </div>
          <div className="footer-right">
            <div className="social-icons">
              <a href="#" className="social-icon facebook">
                <span>f</span>
              </a>
              <a href="#" className="social-icon instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-icon globe">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
