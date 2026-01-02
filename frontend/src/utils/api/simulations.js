import { extractErrorMessage } from '../errorHandler';

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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

export const saveSimulation = async (inputParams, results, policyName = null) => {
  const requestBody = {
    country: inputParams.country,
    policy_type: inputParams.policyType,
    carbon_price_usd: parseFloat(inputParams.carbonPrice),
    coverage_percent: parseFloat(inputParams.coverage),
    year: inputParams.year || 2025,
    projection_years: parseInt(inputParams.duration || 5),
    results: results,
    policy_name: policyName
  };

  try {
    const response = await fetch(`${API_BASE_URL}/simulations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody)
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const getUserSimulations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const getSimulationById = async (simulationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const deleteSimulation = async (simulationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      await handleResponse(response);
    }
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const updateSimulationName = async (simulationId, policyName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ policy_name: policyName })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const compareSimulations = async (options) => {
  const requestBody = {};
  
  if (options.simulationId1) {
    requestBody.simulation_id_1 = options.simulationId1;
  } else if (options.newSimulation1) {
    requestBody.new_simulation_1 = {
      country: options.newSimulation1.country,
      policy_type: options.newSimulation1.policyType,
      carbon_price_usd: parseFloat(options.newSimulation1.carbonPrice),
      coverage_percent: parseFloat(options.newSimulation1.coverage),
      year: options.newSimulation1.year || 2025,
      projection_years: parseInt(options.newSimulation1.duration || 5)
    };
  }

  if (options.simulationId2) {
    requestBody.simulation_id_2 = options.simulationId2;
  } else if (options.newSimulation2) {
    requestBody.new_simulation_2 = {
      country: options.newSimulation2.country,
      policy_type: options.newSimulation2.policyType,
      carbon_price_usd: parseFloat(options.newSimulation2.carbonPrice),
      coverage_percent: parseFloat(options.newSimulation2.coverage),
      year: options.newSimulation2.year || 2025,
      projection_years: parseInt(options.newSimulation2.duration || 5)
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/simulations/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody)
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Network error. Please check your connection and try again.');
  }
};

