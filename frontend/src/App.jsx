import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Simulate from './pages/simulate/Simulate';

function App() {
  return (
    <BrowserRouter>
      <div className="App w-full min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulate" element={<Simulate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
