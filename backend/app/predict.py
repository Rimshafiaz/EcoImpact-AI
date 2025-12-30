import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from .mappings import get_region, get_income_level
from .services import get_country_total_co2

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

def calculate_revenue_formula(carbon_price_usd, coverage_percent, country, year):
    
    total_co2_mt = get_country_total_co2(country, year)
    
    if total_co2_mt is None or total_co2_mt <= 0:
        return 0.01
    
    co2_covered_mt = (coverage_percent / 100) * total_co2_mt
    effective_rate = 0.05
    
    revenue_million_usd = carbon_price_usd * co2_covered_mt * effective_rate
    
    return max(0.01, revenue_million_usd)

def predict_revenue(country, policy_type, carbon_price_usd, coverage_percent, year, fossil_fuel_pct, population, gdp):
    from .mappings import get_region_for_ml
    region = get_region(country)
    income = get_income_level(country)
    
    ml_region = get_region_for_ml(region, income)

    coverage_x_gdp = coverage_percent * gdp

    input_df = pd.DataFrame({
        'Type': [policy_type],
        'Region': [ml_region],
        'Income group': [income],
        'Year': [year],
        'Carbon_Price_USD': [carbon_price_usd],
        'Actual_Coverage_%': [coverage_percent],
        'Coverage_x_GDP': [coverage_x_gdp],
        'Fossil_Fuel_Dependency_%': [fossil_fuel_pct],
        'Population_Log': [np.log(population)],
        'GDP': [gdp]
    })

    try:
        input_df['Type'] = revenue_encoders['Type'].transform(input_df['Type'])
        input_df['Region'] = revenue_encoders['Region'].transform(input_df['Region'])
        input_df['Income group'] = revenue_encoders['Income group'].transform(input_df['Income group'])

        revenue_million_usd = revenue_model.predict(input_df)[0]
        
        if pd.isna(revenue_million_usd) or revenue_million_usd <= 0:
            revenue_million_usd = calculate_revenue_formula(carbon_price_usd, coverage_percent, country, year)

        return revenue_million_usd
    except (ValueError, KeyError) as e:
        return calculate_revenue_formula(carbon_price_usd, coverage_percent, country, year)

def predict_success(country, policy_type, coverage_percent, year, fossil_fuel_pct, gdp):
    from .context import COUNTRIES_WITH_HISTORICAL_DATA
    from .mappings import get_region_for_ml

    region = get_region(country)
    income = get_income_level(country)
    
    ml_region = get_region_for_ml(region, income)

    if country not in COUNTRIES_WITH_HISTORICAL_DATA:
        return 50.0, "At Risk", "Low"

    input_df = pd.DataFrame({
        'Type': [policy_type],
        'Region': [ml_region],
        'Income group': [income],
        'Year': [year],
        'Fossil_Fuel_Dependency_%': [fossil_fuel_pct],
        'GDP': [gdp]
    })

    try:
        input_df['Type'] = success_encoders['Type'].transform(input_df['Type'])
        input_df['Region'] = success_encoders['Region'].transform(input_df['Region'])
        input_df['Income group'] = success_encoders['Income group'].transform(input_df['Income group'])

        abolishment_prob = success_model.predict_proba(input_df)[0][0]
    except (ValueError, KeyError) as e:
        abolishment_prob = 0.50
    
    if pd.isna(abolishment_prob):
        abolishment_prob = 0.50
    elif abolishment_prob < 0:
        abolishment_prob = 0.0
    elif abolishment_prob > 1:
        abolishment_prob = 1.0

    if abolishment_prob <= 0.35:
        risk_category = "Low Risk"
        confidence = "High"
    elif abolishment_prob >= 0.65:
        risk_category = "High Risk"
        confidence = "High"
    else:
        risk_category = "At Risk"
        confidence = "Medium"

    abolishment_risk_percent = abolishment_prob * 100
    
    return abolishment_risk_percent, risk_category, confidence
