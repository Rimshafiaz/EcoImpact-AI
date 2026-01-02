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

export const predictPolicy = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: data.country,
        policy_type: data.policyType,
        carbon_price_usd: parseFloat(data.carbonPrice),
        coverage_percent: parseFloat(data.coverage),
        year: data.year || 2025,
        projection_years: parseInt(data.duration)
      })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const getAvailableCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/countries`);
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(extractErrorMessage({ response: { data: errorData, status: response.status } }));
      error.response = { data: errorData, status: response.status };
      throw error;
    }
    const data = await response.json();
    return data.countries;
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};
