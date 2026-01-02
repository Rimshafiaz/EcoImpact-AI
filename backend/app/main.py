from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .schemas import PredictionRequest, PredictionResponse
from .predict import load_models, predict_revenue, predict_success
from .calculations import calculate_co2_impact, calculate_equivalencies
from .context import generate_context, load_training_data
from .services import load_all_data, get_country_features, get_available_countries, get_country_total_co2
from .auth_routes import router as auth_router
from .simulation_routes import router as simulation_router
from .database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization warning: {e}")
        print("Make sure DATABASE_URL is set in .env file")
    
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

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    field_errors = {}
    for error in errors:
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        field_errors[field] = error["msg"]
    
    first_error = errors[0] if errors else None
    field_name = ".".join(str(loc) for loc in first_error["loc"] if loc != "body") if first_error else "unknown"
    message = first_error["msg"] if first_error else "Invalid input data"
    
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Please check your input: {message}",
                "field": field_name,
                "details": field_errors
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    
    error_code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        500: "INTERNAL_ERROR",
        503: "SERVICE_UNAVAILABLE"
    }
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": error_code_map.get(exc.status_code, "UNKNOWN_ERROR"),
                "message": str(exc.detail) if exc.detail else "An error occurred",
                "details": {}
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}", exc_info=True)
    import traceback
    traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": {}
            }
        }
    )

app.include_router(auth_router)
app.include_router(simulation_router)

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
            co2_impact = {
                'total_country_co2_mt': 0.0,
                'co2_covered_mt': 0.0,
                'co2_covered_percent': request.coverage_percent,
                'co2_uncovered_mt': 0.0,
                'co2_uncovered_percent': 100 - request.coverage_percent,
                'co2_potentially_reduced_mt': 0.0,
                'co2_covered_per_capita_tonnes': 0.0,
                'reduction_rate_used': 0.0,
                'carbon_price_usd': request.carbon_price_usd,
                'disclaimer': f'CO2 emissions data not available for {request.country}. Revenue and risk predictions are still provided.'
            }
        
        equivalencies = calculate_equivalencies(co2_impact['co2_potentially_reduced_mt'])

        abolishment_risk, risk_category, confidence = predict_success(
            request.country,
            request.policy_type,
            request.coverage_percent,
            request.year,
            fossil_fuel_pct,
            gdp
        )

        if risk_category == "Low Risk":
            risk_adjusted_value = predicted_revenue
        else:
            success_probability = 1 - (abolishment_risk / 100)
            risk_adjusted_value = max(0.0, predicted_revenue * success_probability)
        
        risk_adjusted_value = max(0.0, risk_adjusted_value) if risk_adjusted_value is not None else 0.0

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
        
        if not context.get('recommendation') or not isinstance(context['recommendation'], str):
            context['recommendation'] = 'Policy assessment available.'
        if not context.get('similar_policies') or not isinstance(context['similar_policies'], list) or len(context['similar_policies']) == 0:
            context['similar_policies'] = ['Historical policy data analysis available.']
        if not context.get('key_risks') or not isinstance(context['key_risks'], list) or len(context['key_risks']) == 0:
            context['key_risks'] = ['Standard implementation considerations apply.']
        if not context.get('success_context') or not context['success_context'].get('context_message') or not isinstance(context['success_context']['context_message'], str):
            context['success_context'] = {
                'context_message': f'Risk assessment for {request.country} based on regional patterns and economic factors.',
                'recommendation': context.get('recommendation', 'Policy assessment available.'),
                'has_historical_data': False,
                'confidence': 'Medium'
            }

        projections = []
        cumulative_co2_reduced = 0.0
        cumulative_revenue = 0.0
        base_year_co2 = co2_impact['total_country_co2_mt'] if co2_impact else 0.0
        
        projection_years = max(1, min(20, request.projection_years))
        previous_revenue = predicted_revenue
        
        gdp_growth_rate = 0.03
        population_growth_rate = 0.01
        fossil_fuel_decline_rate = 0.005
        min_revenue_growth_rate = 0.015
        
        for year_offset in range(projection_years):
            future_year = request.year + year_offset

            if year_offset == 0:
                future_features = country_features
            else:
                future_features = {
                    'fossil_fuel_pct': max(0, country_features['fossil_fuel_pct'] - (fossil_fuel_decline_rate * year_offset * 100)),
                    'population': country_features['population'] * ((1 + population_growth_rate) ** year_offset),
                    'gdp': country_features['gdp'] * ((1 + gdp_growth_rate) ** year_offset),
                    'region': country_features['region'],
                    'income_group': country_features['income_group']
                }

            carbon_price = request.carbon_price_usd

            if year_offset == 0:
                future_revenue = predicted_revenue
            else:
                future_revenue = predict_revenue(
                    request.country,
                    request.policy_type,
                    carbon_price,
                    request.coverage_percent,
                    future_year,
                    future_features['fossil_fuel_pct'],
                    future_features['population'],
                    future_features['gdp']
                )
                
                if future_revenue <= 0:
                    from .predict import calculate_revenue_formula
                    future_revenue = calculate_revenue_formula(carbon_price, request.coverage_percent, request.country, future_year)
                
                min_expected_revenue = previous_revenue * (1 + min_revenue_growth_rate)
                if future_revenue < min_expected_revenue:
                    future_revenue = min_expected_revenue
                
                max_reasonable_multiplier = 3.0
                if future_revenue > previous_revenue * max_reasonable_multiplier:
                    future_revenue = previous_revenue * max_reasonable_multiplier
            
            previous_revenue = future_revenue

            future_co2 = calculate_co2_impact(
                request.coverage_percent,
                request.country,
                future_year,
                carbon_price
            )
            
            if future_co2 is None:
                future_co2 = {
                    'total_country_co2_mt': 0.0,
                    'co2_covered_mt': 0.0,
                    'co2_potentially_reduced_mt': 0.0,
                    'co2_covered_per_capita_tonnes': 0.0
                }

            future_abolishment, _, _ = predict_success(
                request.country,
                request.policy_type,
                request.coverage_percent,
                future_year,
                future_features['fossil_fuel_pct'],
                future_features['gdp']
            )

            risk_escalation_rate = 0.005
            time_escalated_risk = min(100.0, future_abolishment + (risk_escalation_rate * 100 * year_offset))

            if time_escalated_risk < 35:
                escalated_risk_category = "Low Risk"
            elif time_escalated_risk > 65:
                escalated_risk_category = "High Risk"
            else:
                escalated_risk_category = "At Risk"

            if escalated_risk_category == "Low Risk":
                future_risk_adjusted_value = future_revenue
            else:
                success_probability = 1 - (time_escalated_risk / 100)
                future_risk_adjusted_value = max(0.0, future_revenue * success_probability)

            annual_co2_reduced = round(future_co2['co2_potentially_reduced_mt'], 3) if future_co2 else 0
            annual_co2_reduced = max(0.0, annual_co2_reduced)
            cumulative_co2_reduced += annual_co2_reduced
            cumulative_revenue += future_revenue
            
            future_total_co2 = future_co2['total_country_co2_mt'] if future_co2 else base_year_co2
            future_total_co2 = max(0.0, future_total_co2)
            co2_after_reduction = max(0.0, future_total_co2 - annual_co2_reduced)
            co2_reduced_from_base = max(0.0, cumulative_co2_reduced)

            projection_entry = {
                'year': int(future_year),
                'revenue_million': max(0.0, round(future_revenue, 2)),
                'co2_reduced_mt': max(0.0, annual_co2_reduced),
                'co2_reduced_cumulative_mt': max(0.0, round(cumulative_co2_reduced, 3)),
                'co2_after_reduction_mt': max(0.0, round(co2_after_reduction, 2)),
                'co2_reduced_from_base_mt': max(0.0, round(co2_reduced_from_base, 3)),
                'abolishment_risk_percent': max(0.0, min(100.0, round(time_escalated_risk, 1))),
                'risk_category': str(escalated_risk_category) if escalated_risk_category else "At Risk",
                'risk_adjusted_value_million': max(0.0, round(future_risk_adjusted_value, 2)),
                'cumulative_revenue_million': max(0.0, round(cumulative_revenue, 2))
            }
            projections.append(projection_entry)

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
            equivalencies_source=equivalencies['source_context'],
            risk_adjusted_value_million=max(0.0, round(risk_adjusted_value, 2)) if risk_adjusted_value is not None else 0.0,
            recommendation=context.get('recommendation', 'Policy assessment available.'),
            similar_policies=context.get('similar_policies', ['Historical policy data analysis available.']),
            key_risks=context.get('key_risks', ['Standard implementation considerations apply.']),
            context_explanation=context.get('success_context', {}).get('context_message', f'Risk assessment for {request.country} based on regional patterns and economic factors.'),
            projections=projections if isinstance(projections, list) else []
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
