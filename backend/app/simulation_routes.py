from fastapi import APIRouter, Depends, HTTPException, status, Body, Form, Body
from sqlalchemy.orm import Session
from typing import List
from .database import get_db
from .models import Simulation, User
from .schemas import SimulationSummary, SimulationDetail, CompareSimulationsRequest, PredictionRequest, PredictionResponse
from .auth_routes import get_current_user

router = APIRouter(prefix="/simulations", tags=["simulations"])

def _run_prediction(request: PredictionRequest) -> PredictionResponse:
    from fastapi import HTTPException
    from .schemas import YearProjection
    
    if request.carbon_price_usd <= 0:
        raise HTTPException(400, "Carbon price must be positive")
    if not (10 <= request.coverage_percent <= 90):
        raise HTTPException(400, "Coverage must be between 10-90%")

    try:
        country_features = get_country_features(request.country, request.year)
    except ValueError as e:
        raise HTTPException(400, f"Country data not available: {str(e)}")

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
        raise HTTPException(status_code=400, detail=f"Invalid request data: {str(e)}")
    
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
    
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
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
    simulations = db.query(Simulation).filter(
        Simulation.user_id == current_user.id
    ).order_by(Simulation.created_at.desc()).all()
    
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
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    policy_name = body.get('policy_name')
    if policy_name is not None:
        simulation.policy_name = policy_name
        db.commit()
        db.refresh(simulation)
    
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    db.delete(simulation)
    db.commit()
    
    return None

@router.post("/compare")
def compare_simulations(
    request: CompareSimulationsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    simulation_1 = None
    simulation_2 = None
    
    if request.simulation_id_1:
        sim = db.query(Simulation).filter(
            Simulation.id == request.simulation_id_1,
            Simulation.user_id == current_user.id
        ).first()
        if not sim:
            raise HTTPException(status_code=404, detail="Simulation 1 not found")
        simulation_1 = {
            "input": PredictionRequest(**sim.input_params),
            "results": PredictionResponse(**sim.results),
            "id": sim.id,
            "policy_name": sim.policy_name
        }
    elif request.new_simulation_1:
        results_1 = _run_prediction(request.new_simulation_1)
        simulation_1 = {
            "input": request.new_simulation_1,
            "results": results_1,
            "id": None,
            "policy_name": generate_policy_name(request.new_simulation_1.dict())
        }
    else:
        raise HTTPException(status_code=400, detail="Either simulation_id_1 or new_simulation_1 must be provided")
    
    if request.simulation_id_2:
        sim = db.query(Simulation).filter(
            Simulation.id == request.simulation_id_2,
            Simulation.user_id == current_user.id
        ).first()
        if not sim:
            raise HTTPException(status_code=404, detail="Simulation 2 not found")
        simulation_2 = {
            "input": PredictionRequest(**sim.input_params),
            "results": PredictionResponse(**sim.results),
            "id": sim.id,
            "policy_name": sim.policy_name
        }
    elif request.new_simulation_2:
        results_2 = _run_prediction(request.new_simulation_2)
        simulation_2 = {
            "input": request.new_simulation_2,
            "results": results_2,
            "id": None,
            "policy_name": generate_policy_name(request.new_simulation_2.dict())
        }
    else:
        raise HTTPException(status_code=400, detail="Either simulation_id_2 or new_simulation_2 must be provided")
    
    return {
        "simulation_1": simulation_1,
        "simulation_2": simulation_2
    }

