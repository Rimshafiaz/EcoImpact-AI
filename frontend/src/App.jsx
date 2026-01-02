import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useContext, useState } from 'react';
import Navbar from './components/Navbar';
import { NotificationContainer } from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Simulate from './pages/simulate/Simulate';
import Compare from './pages/compare/Compare';
import History from './pages/history/History';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';

const NotificationContext = createContext(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showNotification: () => {},
      showError: () => {},
      showSuccess: () => {},
      showWarning: () => {},
      showInfo: () => {}
    };
  }
  return context;
};

function App() {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const notificationValue = {
    showNotification,
    showError: (message, duration) => showNotification(message, 'error', duration),
    showSuccess: (message, duration) => showNotification(message, 'success', duration),
    showWarning: (message, duration) => showNotification(message, 'warning', duration),
    showInfo: (message, duration) => showNotification(message, 'info', duration),
    clearAllNotifications: () => setNotifications([])
  };

  return (
    <NotificationContext.Provider value={notificationValue}>
      <BrowserRouter>
        <div className="App w-full min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
          <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
        </div>
      </BrowserRouter>
    </NotificationContext.Provider>
  );
}

export default App;
