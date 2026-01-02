import { useEffect, useState } from 'react';

const Notification = ({ message, type = 'error', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-900/90 border-green-500',
    error: 'bg-red-900/90 border-red-500',
    warning: 'bg-yellow-900/90 border-yellow-500',
    info: 'bg-blue-900/90 border-blue-500'
  }[type] || 'bg-red-900/90 border-red-500';

  const textColor = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300'
  }[type] || 'text-red-300';

  if (!isVisible) return null;

  return (
    <div
      className={`${bgColor} border rounded-lg px-4 py-3 mb-3 flex items-center justify-between min-w-[300px] max-w-[500px] shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <p className={`${textColor} text-sm font-medium flex-1`}>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className={`${textColor} ml-4 hover:opacity-70 transition-opacity`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'error', duration = null) => {
    if (duration === null) {
      duration = type === 'success' ? 2500 : type === 'error' ? 4000 : 3000;
    }
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showError: (message, duration) => showNotification(message, 'error', duration),
    showSuccess: (message, duration) => showNotification(message, 'success', duration),
    showWarning: (message, duration) => showNotification(message, 'warning', duration),
    showInfo: (message, duration) => showNotification(message, 'info', duration)
  };
};

