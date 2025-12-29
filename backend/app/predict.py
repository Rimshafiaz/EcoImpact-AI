import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from .mappings import get_region, get_income_level

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR.parent.parent / "ML Model"

revenue_model = None
revenue_encoders = None
success_model = None
success_encoders = None

def load_models():
    global revenue_model, revenue_encoders, success_model, success_encoders

    revenue_model = joblib.load(MODELS_DIR / 'revenue_model_gb.pkl')
    revenue_encoders = joblib.load(MODELS_DIR / 'revenue_encoders.pkl')
    success_model = joblib.load(MODELS_DIR / 'success_model_gb.pkl')
    success_encoders = joblib.load(MODELS_DIR / 'success_encoders.pkl')

def predict_revenue(country, policy_type, carbon_price_usd, coverage_percent, year, fossil_fuel_pct, population, gdp):
    region = get_region(country)
    income = get_income_level(country)

    coverage_x_gdp = coverage_percent * gdp

    input_df = pd.DataFrame({
        'Type': [policy_type],
        'Region': [region],
        'Income group': [income],
        'Year': [year],
        'Carbon_Price_USD': [carbon_price_usd],
        'Actual_Coverage_%': [coverage_percent],
        'Coverage_x_GDP': [coverage_x_gdp],
        'Fossil_Fuel_Dependency_%': [fossil_fuel_pct],
        'Population_Log': [np.log(population)],
        'GDP': [gdp]
    })

    input_df['Type'] = revenue_encoders['Type'].transform(input_df['Type'])
    input_df['Region'] = revenue_encoders['Region'].transform(input_df['Region'])
    input_df['Income group'] = revenue_encoders['Income group'].transform(input_df['Income group'])

    revenue_million_usd = revenue_model.predict(input_df)[0]

    return revenue_million_usd

def predict_success(country, policy_type, coverage_percent, year, fossil_fuel_pct, gdp):
    from .context import COUNTRIES_WITH_HISTORICAL_DATA

    region = get_region(country)
    income = get_income_level(country)

    if country not in COUNTRIES_WITH_HISTORICAL_DATA:
        return 50.0, "At Risk", "Low"

    input_df = pd.DataFrame({
        'Type': [policy_type],
        'Region': [region],
        'Income group': [income],
        'Year': [year],
        'Fossil_Fuel_Dependency_%': [fossil_fuel_pct],
        'GDP': [gdp]
    })

    input_df['Type'] = success_encoders['Type'].transform(input_df['Type'])
    input_df['Region'] = success_encoders['Region'].transform(input_df['Region'])
    input_df['Income group'] = success_encoders['Income group'].transform(input_df['Income group'])

    abolishment_prob = success_model.predict_proba(input_df)[0][0]

    if abolishment_prob < 0.35:
        risk_category = "Low Risk"
        confidence = "High"
    elif abolishment_prob > 0.65:
        risk_category = "High Risk"
        confidence = "High"
    else:
        risk_category = "At Risk"
        confidence = "Medium"

    return abolishment_prob * 100, risk_category, confidence
