from fastapi import APIRouter, Depends, HTTPException, status, Body, Form, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from typing import List
from .database import get_db
from .models import Simulation, User, Comparison
from .schemas import SimulationSummary, SimulationDetail, CompareSimulationsRequest, PredictionRequest, PredictionResponse, SaveComparisonRequest, ComparisonSummary, ComparisonDetail
from .auth_routes import get_current_user
from .services import get_country_features
from .predict import predict_revenue, predict_success
from .calculations import calculate_co2_impact, calculate_equivalencies
from .context import generate_context
from .errors import (
    raise_validation_error, raise_not_found_error, raise_service_unavailable_error,
    raise_internal_error
)

router = APIRouter(prefix="/simulations", tags=["simulations"])

def _run_prediction(request: PredictionRequest) -> PredictionResponse:
    from .schemas import YearProjection
    
    if request.carbon_price_usd <= 0:
        raise_validation_error(
            "Carbon price must be greater than 0",
            field="carbon_price_usd",
            details={"min_value": 0.01}
        )
    
    if request.carbon_price_usd > 1000:
        raise_validation_error(
            "Carbon price cannot exceed $1,000 per tonne. Please enter a realistic value.",
            field="carbon_price_usd",
            details={"max_value": 1000}
        )
    
    if not (10 <= request.coverage_percent <= 90):
        raise_validation_error(
            "Coverage must be between 10% and 90%",
            field="coverage_percent",
            details={"min_value": 10, "max_value": 90}
        )
    
    if request.year < 2000 or request.year > 2100:
        raise_validation_error(
            "Year must be between 2000 and 2100",
            field="year",
            details={"min_value": 2000, "max_value": 2100}
        )
    
    if request.projection_years < 1 or request.projection_years > 50:
        raise_validation_error(
            "Projection duration must be between 1 and 50 years",
            field="projection_years",
            details={"min_value": 1, "max_value": 50}
        )
    
    if not request.country or not request.country.strip():
        raise_validation_error(
            "Please select a country",
            field="country"
        )
    
    if not request.policy_type or not request.policy_type.strip():
        raise_validation_error(
            "Please select a policy type",
            field="policy_type"
        )

    try:
        country_features = get_country_features(request.country, request.year)
    except ValueError as e:
        raise_validation_error(
            f"Data is not available for {request.country} for the year {request.year}. Please try a different country or year.",
            field="country",
            details={"country": request.country, "year": request.year}
        )

    region = country_features['region']
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

def generate_policy_name(input_params: dict) -> str:
    country = input_params.get("country", "Unknown")
    policy_type = input_params.get("policy_type", "Policy")
    year = input_params.get("year", "")
    return f"{policy_type} - {country} {year}"

@router.post("", response_model=SimulationDetail, status_code=status.HTTP_201_CREATED)
def save_simulation(
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from pydantic import ValidationError
    
    results_data = body.get('results', {})
    policy_name = body.get('policy_name', None)
    
    input_body = {k: v for k, v in body.items() if k not in ['results', 'policy_name']}
    
    try:
        input_params = PredictionRequest(**input_body)
        results = PredictionResponse(**results_data)
    except ValidationError as e:
        error_messages = []
        for err in e.errors():
            field = ".".join(str(loc) for loc in err["loc"])
            error_messages.append(f"{field}: {err['msg']}")
        raise_validation_error(
            "Invalid simulation data. " + "; ".join(error_messages[:3]),
            details={"validation_errors": e.errors()}
        )
    
    input_dict = input_params.dict()
    results_dict = results.dict()
    
    if not policy_name:
        policy_name = generate_policy_name(input_dict)
    
    simulation = Simulation(
        user_id=current_user.id,
        policy_name=policy_name,
        input_params=input_dict,
        results=results_dict
    )
    
    try:
        db.add(simulation)
        db.commit()
        db.refresh(simulation)
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to save simulation due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    return SimulationDetail(
        id=simulation.id,
        user_id=simulation.user_id,
        policy_name=simulation.policy_name,
        created_at=simulation.created_at,
        input_params=simulation.input_params,
        results=PredictionResponse(**simulation.results)
    )

@router.get("", response_model=List[SimulationSummary])
def get_user_simulations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        simulations = db.query(Simulation).filter(
            Simulation.user_id == current_user.id
        ).order_by(Simulation.created_at.desc()).all()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to load your simulations due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    summaries = []
    for sim in simulations:
        input_params = sim.input_params
        results = sim.results
        
        summaries.append(SimulationSummary(
            id=sim.id,
            policy_name=sim.policy_name,
            created_at=sim.created_at,
            country=input_params.get("country", "Unknown"),
            policy_type=input_params.get("policy_type", "Unknown"),
            carbon_price_usd=input_params.get("carbon_price_usd", 0),
            coverage_percent=input_params.get("coverage_percent", 0),
            revenue_million=results.get("revenue_million", 0),
            risk_category=results.get("risk_category", "Unknown")
        ))
    
    return summaries

@router.get("/{simulation_id}", response_model=SimulationDetail)
def get_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        simulation = db.query(Simulation).filter(
            Simulation.id == simulation_id,
            Simulation.user_id == current_user.id
        ).first()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to connect to the database. Please try again in a moment.",
            service="database"
        )
    
    if not simulation:
        raise_not_found_error(
            "Simulation not found. It may have been deleted or you don't have permission to view it.",
            resource="simulation"
        )
    
    return SimulationDetail(
        id=simulation.id,
        user_id=simulation.user_id,
        policy_name=simulation.policy_name,
        created_at=simulation.created_at,
        input_params=simulation.input_params,
        results=PredictionResponse(**simulation.results)
    )

@router.patch("/{simulation_id}", response_model=SimulationDetail)
def update_simulation(
    simulation_id: int,
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from .schemas import PredictionResponse
    
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise_not_found_error(
            "Simulation not found. It may have been deleted or you don't have permission to view it.",
            resource="simulation"
        )
    
    policy_name = body.get('policy_name')
    if policy_name is not None:
        if not isinstance(policy_name, str) or not policy_name.strip():
            raise_validation_error(
                "Policy name cannot be empty",
                field="policy_name"
            )
        if len(policy_name) > 200:
            raise_validation_error(
                "Policy name cannot exceed 200 characters",
                field="policy_name",
                details={"max_length": 200}
            )
        simulation.policy_name = policy_name
        try:
            db.commit()
            db.refresh(simulation)
        except OperationalError as e:
            db.rollback()
            raise_service_unavailable_error(
                "Unable to update simulation name due to a database connection issue. Please try again in a moment.",
                service="database"
            )
    
    return SimulationDetail(
        id=simulation.id,
        user_id=simulation.user_id,
        policy_name=simulation.policy_name,
        created_at=simulation.created_at,
        input_params=simulation.input_params,
        results=PredictionResponse(**simulation.results)
    )

@router.delete("/{simulation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise_not_found_error(
            "Simulation not found. It may have been deleted or you don't have permission to delete it.",
            resource="simulation"
        )
    
    try:
        db.delete(simulation)
        db.commit()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to delete simulation due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    return None

@router.post("/compare")
def compare_simulations(
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from pydantic import ValidationError
    
    simulation_1 = None
    simulation_2 = None
    
    def convert_id(id_value):
        if id_value is None:
            return None
        if id_value == '' or id_value == 'null' or id_value == 'undefined':
            return None
        if isinstance(id_value, int):
            return id_value
        if isinstance(id_value, float):
            return int(id_value)
        if isinstance(id_value, str):
            try:
                return int(id_value)
            except (ValueError, TypeError):
                return None
        return None
    
    sim_id_1_raw = body.get('simulation_id_1')
    sim_id_2_raw = body.get('simulation_id_2')
    sim_id_1 = convert_id(sim_id_1_raw)
    sim_id_2 = convert_id(sim_id_2_raw)
    
    # Process first simulation
    if sim_id_1:
        try:
            sim = db.query(Simulation).filter(
                Simulation.id == sim_id_1,
                Simulation.user_id == current_user.id
            ).first()
        except OperationalError as e:
            db.rollback()
            raise_service_unavailable_error(
                "Unable to load simulation due to a database connection issue. Please try again in a moment.",
                service="database"
            )
        if not sim:
            raise_not_found_error(
                "First simulation not found. It may have been deleted or you don't have permission to view it.",
                resource="simulation"
            )
        simulation_1 = {
            "input": PredictionRequest(**sim.input_params),
            "results": PredictionResponse(**sim.results),
            "id": sim.id,
            "policy_name": sim.policy_name
        }
    elif body.get('new_simulation_1'):
        try:
            new_sim_1 = PredictionRequest(**body.get('new_simulation_1'))
            results_1 = _run_prediction(new_sim_1)
            simulation_1 = {
                "input": new_sim_1,
                "results": results_1,
                "id": None,
                "policy_name": generate_policy_name(new_sim_1.dict())
            }
        except ValidationError as e:
            raise_validation_error(
                "Invalid data for new simulation 1. Please check all required fields.",
                field="new_simulation_1"
            )
    else:
        raise_validation_error(
            "Please provide either a saved simulation or create a new simulation for the first policy",
            field="simulation_id_1"
        )
    
    if sim_id_2:
        try:
            sim = db.query(Simulation).filter(
                Simulation.id == sim_id_2,
                Simulation.user_id == current_user.id
            ).first()
        except OperationalError as e:
            db.rollback()
            raise_service_unavailable_error(
                "Unable to load simulation due to a database connection issue. Please try again in a moment.",
                service="database"
            )
        if not sim:
            raise_not_found_error(
                "Second simulation not found. It may have been deleted or you don't have permission to view it.",
                resource="simulation"
            )
        simulation_2 = {
            "input": PredictionRequest(**sim.input_params),
            "results": PredictionResponse(**sim.results),
            "id": sim.id,
            "policy_name": sim.policy_name
        }
    elif body.get('new_simulation_2'):
        try:
            new_sim_2 = PredictionRequest(**body.get('new_simulation_2'))
            results_2 = _run_prediction(new_sim_2)
            simulation_2 = {
                "input": new_sim_2,
                "results": results_2,
                "id": None,
                "policy_name": generate_policy_name(new_sim_2.dict())
            }
        except ValidationError as e:
            raise_validation_error(
                "Invalid data for new simulation 2. Please check all required fields.",
                field="new_simulation_2"
            )
    else:
        raise_validation_error(
            "Please provide either a saved simulation or create a new simulation for the second policy",
            field="simulation_id_2"
        )
    
    return {
        "simulation_1": simulation_1,
        "simulation_2": simulation_2
    }

@router.post("/comparisons", response_model=ComparisonDetail, status_code=status.HTTP_201_CREATED)
def save_comparison(
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from pydantic import ValidationError
    
    # Extract and convert IDs before validation
    sim1_id_raw = body.get('simulation_1_id')
    sim2_id_raw = body.get('simulation_2_id')
    
    # Convert IDs to integers or None - handle all possible input types
    def convert_id(id_value):
        if id_value is None:
            return None
        if id_value == '' or id_value == 'null' or id_value == 'undefined':
            return None
        if isinstance(id_value, int):
            return id_value
        if isinstance(id_value, float):
            return int(id_value)
        if isinstance(id_value, str):
            try:
                return int(id_value)
            except (ValueError, TypeError):
                return None
        return None
    
    sim1_id = convert_id(sim1_id_raw)
    sim2_id = convert_id(sim2_id_raw)
    
    comparison_name = body.get('comparison_name')
    sim1_data_raw = body.get('simulation_1_data', {})
    sim2_data_raw = body.get('simulation_2_data', {})
    
    # Validate required fields
    if not isinstance(sim1_data_raw, dict):
        raise_validation_error(
            "simulation_1_data must be a valid object",
            field="simulation_1_data"
        )
    if not isinstance(sim2_data_raw, dict):
        raise_validation_error(
            "simulation_2_data must be a valid object",
            field="simulation_2_data"
        )
    
    def normalize_sim_data(sim_data):
        if not isinstance(sim_data, dict):
            return sim_data
        
        if hasattr(sim_data.get('input'), 'dict'):
            sim_data['input'] = sim_data['input'].dict()
        elif hasattr(sim_data.get('input'), 'model_dump'):
            sim_data['input'] = sim_data['input'].model_dump()
        
        if hasattr(sim_data.get('results'), 'dict'):
            sim_data['results'] = sim_data['results'].dict()
        elif hasattr(sim_data.get('results'), 'model_dump'):
            sim_data['results'] = sim_data['results'].model_dump()
        
        if 'input_params' not in sim_data and 'input' in sim_data:
            sim_data['input_params'] = sim_data['input']
        
        return sim_data
    
    sim1_data = normalize_sim_data(sim1_data_raw)
    sim2_data = normalize_sim_data(sim2_data_raw)
    
    if not comparison_name:
        sim1_name = sim1_data.get('policy_name') or (sim1_data.get('input', {}).get('country', 'Policy') if isinstance(sim1_data.get('input'), dict) else 'Policy 1')
        sim2_name = sim2_data.get('policy_name') or (sim2_data.get('input', {}).get('country', 'Policy') if isinstance(sim2_data.get('input'), dict) else 'Policy 2')
        comparison_name = f"{sim1_name} vs {sim2_name}"
    
    comparison = Comparison(
        user_id=current_user.id,
        comparison_name=comparison_name,
        simulation_1_id=sim1_id,
        simulation_2_id=sim2_id,
        simulation_1_data=sim1_data,
        simulation_2_data=sim2_data
    )
    
    try:
        db.add(comparison)
        db.commit()
        db.refresh(comparison)
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to save comparison due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    return ComparisonDetail(
        id=int(comparison.id),
        user_id=int(comparison.user_id),
        comparison_name=comparison.comparison_name,
        created_at=comparison.created_at,
        simulation_1_id=int(comparison.simulation_1_id) if comparison.simulation_1_id else None,
        simulation_2_id=int(comparison.simulation_2_id) if comparison.simulation_2_id else None,
        simulation_1_data=comparison.simulation_1_data,
        simulation_2_data=comparison.simulation_2_data
    )

@router.get("/comparisons", response_model=List[ComparisonSummary])
def get_user_comparisons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        comparisons = db.query(Comparison).filter(
            Comparison.user_id == current_user.id
        ).order_by(Comparison.created_at.desc()).all()
        logger.info(f"Found {len(comparisons)} comparisons for user {current_user.id}")
    except OperationalError as e:
        raise_service_unavailable_error(
            "Unable to load comparisons due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    result = []
    for comp in comparisons:
        try:
            if not comp.simulation_1_data or not comp.simulation_2_data:
                continue
            
            sim1_data = comp.simulation_1_data
            sim2_data = comp.simulation_2_data
            
            if not isinstance(sim1_data, dict) or not isinstance(sim2_data, dict):
                continue
            
            sim1_input = sim1_data.get('input') or sim1_data.get('input_params') or {}
            sim2_input = sim2_data.get('input') or sim2_data.get('input_params') or {}
            
            if not isinstance(sim1_input, dict):
                sim1_input = {}
            if not isinstance(sim2_input, dict):
                sim2_input = {}
            
            policy_1_name = sim1_data.get('policy_name') or f"{sim1_input.get('policy_type', 'Policy')} - {sim1_input.get('country', 'Unknown')}"
            policy_2_name = sim2_data.get('policy_name') or f"{sim2_input.get('policy_type', 'Policy')} - {sim2_input.get('country', 'Unknown')}"
            
            country_1 = sim1_input.get('country', 'N/A')
            country_2 = sim2_input.get('country', 'N/A')
            
            comp_id = int(comp.id) if comp.id else 0
            
            result.append(ComparisonSummary(
                id=comp_id,
                comparison_name=comp.comparison_name,
                created_at=comp.created_at,
                policy_1_name=policy_1_name,
                policy_2_name=policy_2_name,
                country_1=country_1,
                country_2=country_2
            ))
        except Exception as e:
            logger.warning(f"Skipping comparison: {str(e)}")
            continue
    
    return result

@router.get("/comparisons/{comparison_id}", response_model=ComparisonDetail)
def get_comparison(
    comparison_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comparison = db.query(Comparison).filter(
            Comparison.id == comparison_id,
            Comparison.user_id == current_user.id
        ).first()
    except OperationalError as e:
        raise_service_unavailable_error(
            "Unable to load comparison due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    if not comparison:
        raise_not_found_error(
            "Comparison not found. It may have been deleted or you don't have permission to view it.",
            resource="comparison"
        )
    
    return ComparisonDetail(
        id=int(comparison.id),
        user_id=int(comparison.user_id),
        comparison_name=comparison.comparison_name,
        created_at=comparison.created_at,
        simulation_1_id=int(comparison.simulation_1_id) if comparison.simulation_1_id else None,
        simulation_2_id=int(comparison.simulation_2_id) if comparison.simulation_2_id else None,
        simulation_1_data=comparison.simulation_1_data,
        simulation_2_data=comparison.simulation_2_data
    )

@router.delete("/comparisons/{comparison_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comparison(
    comparison_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comparison = db.query(Comparison).filter(
            Comparison.id == comparison_id,
            Comparison.user_id == current_user.id
        ).first()
    except OperationalError as e:
        raise_service_unavailable_error(
            "Unable to delete comparison due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    if not comparison:
        raise_not_found_error(
            "Comparison not found. It may have been deleted or you don't have permission to delete it.",
            resource="comparison"
        )
    
    try:
        db.delete(comparison)
        db.commit()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to delete comparison due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    return None

