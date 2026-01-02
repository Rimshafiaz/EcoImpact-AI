import { extractErrorMessage } from '../errorHandler';

const API_BASE_URL = 'http://localhost:8000';

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `Server error: ${response.status} ${response.statusText}` };
    }
    const error = new Error(extractErrorMessage({ response: { data: errorData, status: response.status } }));
    error.response = { data: errorData, status: response.status };
    throw error;
  }
  return await response.json();
};

export const signup = async (email, password, fullName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName || null
      })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const login = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const data = await handleResponse(response);
    
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }

    return data;
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      const errorData = await response.json();
      const error = new Error(extractErrorMessage({ response: { data: errorData, status: response.status } }));
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const verifyEmail = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

