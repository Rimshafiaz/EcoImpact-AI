const ErrorBanner = ({ message, onDismiss, type = 'error' }) => {
  if (!message) return null;

  const bgColor = {
    error: 'bg-red-900/20 border-red-500/50',
    warning: 'bg-yellow-900/20 border-yellow-500/50',
    info: 'bg-blue-900/20 border-blue-500/50'
  }[type] || 'bg-red-900/20 border-red-500/50';

  const textColor = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }[type] || 'text-red-400';

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-4 flex items-center justify-between`}>
      <div className="flex items-center flex-1">
        <svg
          className={`w-5 h-5 ${textColor} mr-3 flex-shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {type === 'error' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
          {type === 'warning' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          )}
          {type === 'info' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        <p className={`${textColor} text-sm font-medium`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${textColor} ml-4 hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;

