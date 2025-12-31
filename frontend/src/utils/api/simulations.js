const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
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

  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save simulation');
  }

  return await response.json();
};

export const getUserSimulations = async () => {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch simulations');
  }

  return await response.json();
};

export const getSimulationById = async (simulationId) => {
  const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch simulation');
  }

  return await response.json();
};

export const deleteSimulation = async (simulationId) => {
  const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete simulation');
  }
};

export const updateSimulationName = async (simulationId, policyName) => {
  const response = await fetch(`${API_BASE_URL}/simulations/${simulationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ policy_name: policyName })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update simulation name');
  }

  return await response.json();
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

  const response = await fetch(`${API_BASE_URL}/simulations/compare`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to compare simulations');
  }

  return await response.json();
};

