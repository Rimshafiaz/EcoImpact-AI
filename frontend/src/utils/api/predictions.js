const API_BASE_URL = 'http://localhost:8000';

export const predictPolicy = async (data) => {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Prediction failed');
  }

  return await response.json();
};

export const getAvailableCountries = async () => {
  const response = await fetch(`${API_BASE_URL}/countries`);
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  const data = await response.json();
  return data.countries;
};
