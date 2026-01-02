export const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred";
  
  if (typeof error === "string") return error;
  
  if (error.response) {
    const data = error.response.data || error.response;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (data?.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (data.detail?.error?.message) {
        return data.detail.error.message;
      }
    }
    if (data?.message) return data.message;
  }
  
  if (error.error?.message) return error.error.message;
  if (error.message) return error.message;
  
  return "An unexpected error occurred. Please try again.";
};

export const extractErrorField = (error) => {
  if (!error) return null;
  
  if (error.response?.data?.error?.field) {
    return error.response.data.error.field;
  }
  
  if (error.response?.data?.detail?.error?.field) {
    return error.response.data.detail.error.field;
  }
  
  return null;
};

export const extractErrorCode = (error) => {
  if (!error) return "UNKNOWN_ERROR";
  
  if (error.response?.data?.error?.code) {
    return error.response.data.error.code;
  }
  
  if (error.response?.data?.detail?.error?.code) {
    return error.response.data.detail.error.code;
  }
  
  if (error.response?.status === 401) return "UNAUTHORIZED";
  if (error.response?.status === 403) return "FORBIDDEN";
  if (error.response?.status === 404) return "NOT_FOUND";
  if (error.response?.status === 409) return "CONFLICT";
  if (error.response?.status === 503) return "SERVICE_UNAVAILABLE";
  if (error.response?.status >= 500) return "SERVER_ERROR";
  if (error.response?.status >= 400) return "CLIENT_ERROR";
  
  return "UNKNOWN_ERROR";
};

export const isNetworkError = (error) => {
  if (!error.response && error.message) {
    return (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("network") ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK"
    );
  }
  return false;
};

export const shouldRetry = (error) => {
  const code = extractErrorCode(error);
  return code === "SERVICE_UNAVAILABLE" || code === "SERVER_ERROR" || isNetworkError(error);
};

export const handleApiError = async (error, retryFn = null, maxRetries = 3) => {
  const message = extractErrorMessage(error);
  const code = extractErrorCode(error);
  const field = extractErrorField(error);
  
  if (shouldRetry(error) && retryFn && maxRetries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return handleApiError(await retryFn().catch((e) => e), retryFn, maxRetries - 1);
  }
  
  return {
    message,
    code,
    field,
    originalError: error
  };
};

