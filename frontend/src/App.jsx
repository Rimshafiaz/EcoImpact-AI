import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Simulate from './pages/simulate/Simulate';
import Compare from './pages/compare/Compare';
import History from './pages/history/History';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <div className="App w-full min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/history" element={<History />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
