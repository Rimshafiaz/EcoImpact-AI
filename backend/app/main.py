from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .schemas import PredictionRequest, PredictionResponse
from .predict import load_models, predict_revenue, predict_success
from .calculations import calculate_co2_impact, calculate_equivalencies
from .context import generate_context, load_training_data
from .services import load_all_data, get_country_features, get_available_countries, get_country_total_co2
import numpy as np

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    load_all_data()
    load_training_data()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EcoImpact AI Backend - Ready"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": True}

@app.post("/predict/all", response_model=PredictionResponse)
def predict_all(request: PredictionRequest):
    try:
        if request.carbon_price_usd <= 0:
            raise HTTPException(400, "Carbon price must be positive")
        if not (10 <= request.coverage_percent <= 90):
            raise HTTPException(400, "Coverage must be between 10-90%")

        try:
            country_features = get_country_features(request.country, request.year)
        except ValueError as e:
            raise HTTPException(400, f"Country data not available: {str(e)}")

        region = country_features['region']
        income_group = country_features['income_group']
        fossil_fuel_pct = country_features['fossil_fuel_pct']
        population = country_features['population']
        gdp = country_features['gdp']

        predicted_revenue = predict_revenue(
            request.country,
            request.policy_type,
            request.carbon_price_usd,
            request.coverage_percent,
            request.year,
            fossil_fuel_pct,
            population,
            gdp
        )

        co2_impact = calculate_co2_impact(
            request.coverage_percent,
            request.country,
            request.year,
            request.carbon_price_usd
        )

        if co2_impact is None:
            raise HTTPException(400, f"CO2 data not available for {request.country}")

        equivalencies = calculate_equivalencies(co2_impact['co2_potentially_reduced_mt'])

        abolishment_risk, risk_category, confidence = predict_success(
            request.country,
            request.policy_type,
            request.coverage_percent,
            request.year,
            fossil_fuel_pct,
            gdp
        )

        risk_multiplier = 1 - (abolishment_risk / 100) * 0.5
        risk_adjusted_value = predicted_revenue * risk_multiplier

        ci_margin = predicted_revenue * 0.11

        context = generate_context(
            request.country,
            request.policy_type,
            request.carbon_price_usd,
            request.coverage_percent,
            predicted_revenue,
            abolishment_risk,
            risk_category,
            region
        )

        projections = []
        for year_offset in range(request.projection_years):
            future_year = request.year + year_offset

            try:
                future_features = get_country_features(request.country, future_year)
            except ValueError:
                future_features = country_features

            future_revenue = predict_revenue(
                request.country,
                request.policy_type,
                request.carbon_price_usd,
                request.coverage_percent,
                future_year,
                future_features['fossil_fuel_pct'],
                future_features['population'],
                future_features['gdp']
            )

            future_co2 = calculate_co2_impact(
                request.coverage_percent,
                request.country,
                future_year,
                request.carbon_price_usd
            )

            future_abolishment, future_risk, _ = predict_success(
                request.country,
                request.policy_type,
                request.coverage_percent,
                future_year,
                future_features['fossil_fuel_pct'],
                future_features['gdp']
            )

            projections.append({
                'year': future_year,
                'revenue_million': round(future_revenue, 2),
                'co2_reduced_mt': round(future_co2['co2_potentially_reduced_mt'], 2) if future_co2 else 0,
                'abolishment_risk_percent': round(future_abolishment, 1),
                'risk_category': future_risk
            })

        return PredictionResponse(
            revenue_million=round(predicted_revenue, 2),
            abolishment_risk_percent=round(abolishment_risk, 1),
            risk_category=risk_category,
            total_country_co2_mt=co2_impact['total_country_co2_mt'],
            co2_covered_mt=co2_impact['co2_covered_mt'],
            co2_reduced_mt=co2_impact['co2_potentially_reduced_mt'],
            co2_covered_per_capita_tonnes=co2_impact['co2_covered_per_capita_tonnes'],
            cars_off_road_equivalent=equivalencies['cars_off_road_1year'],
            trees_planted_equivalent=equivalencies['trees_planted_1year'],
            coal_plants_closed_equivalent=equivalencies['coal_plants_closed'],
            homes_powered_equivalent=equivalencies['homes_powered_clean_1year'],
            risk_adjusted_value_million=round(risk_adjusted_value, 2),
            confidence_interval_low=round(predicted_revenue - ci_margin, 2),
            confidence_interval_high=round(predicted_revenue + ci_margin, 2),
            recommendation=context['recommendation'],
            similar_policies=context['similar_policies'],
            key_risks=context['key_risks'],
            context_explanation=context['success_context']['context_message'],
            projections=projections
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Prediction error: {str(e)}")

@app.get("/countries")
def get_countries():
    countries = get_available_countries()
    return {
        "countries": countries,
        "count": len(countries)
    }

@app.get("/policy-types")
def get_policy_types():
    return {
        "policy_types": ["Carbon tax", "ETS"],
        "descriptions": {
            "Carbon tax": "Direct tax on carbon emissions ($/tonne CO2)",
            "ETS": "Emissions Trading System (cap-and-trade)"
        }
    }

@app.get("/country-info/{country}")
def get_country_info(country: str, year: int = 2024):
    try:
        features = get_country_features(country, year)
        co2 = get_country_total_co2(country, year)

        return {
            "country": country,
            "year": year,
            "region": features['region'],
            "income_group": features['income_group'],
            "population": features['population'],
            "population_formatted": f"{features['population']:,}",
            "gdp_million": features['gdp'],
            "gdp_formatted": f"${features['gdp']:,.0f}M",
            "fossil_fuel_pct": round(features['fossil_fuel_pct'], 1),
            "total_co2_mt": round(co2, 1),
            "co2_per_capita_tonnes": round((co2 * 1_000_000) / features['population'], 2)
        }
    except ValueError as e:
        raise HTTPException(404, f"Country data not found: {str(e)}")
