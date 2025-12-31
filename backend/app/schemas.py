from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PredictionRequest(BaseModel):
    country: str = Field(..., description="Country name")
    policy_type: str = Field(..., description="Carbon tax or ETS")
    carbon_price_usd: float = Field(..., gt=0, description="Carbon price in USD per tonne CO2")
    coverage_percent: float = Field(..., ge=10, le=90, description="Emission coverage percentage")
    year: int = Field(2025, ge=2000, le=2050, description="Policy start year")
    projection_years: int = Field(5, ge=1, le=20, description="Number of years to project (1-20)")

class YearProjection(BaseModel):
    year: int
    revenue_million: float
    cumulative_revenue_million: float = Field(..., description="Cumulative revenue from Year 1 to this year (Million USD)")
    co2_reduced_mt: float = Field(..., description="Annual CO2 reduction for this year (Million tonnes)")
    co2_reduced_cumulative_mt: float = Field(..., description="Cumulative CO2 reduction from Year 1 to this year (Million tonnes)")
    co2_after_reduction_mt: float = Field(..., description="CO2 level after reduction for this year (Million tonnes)")
    co2_reduced_from_base_mt: float = Field(..., description="Total CO2 reduced from base year (Year 1) to this year (Million tonnes)")
    abolishment_risk_percent: float
    risk_category: str
    risk_adjusted_value_million: float = Field(..., description="Revenue adjusted for abolishment risk (Million USD)")

class PredictionResponse(BaseModel):
    revenue_million: float = Field(..., description="Predicted revenue (Million USD)")

    abolishment_risk_percent: float = Field(..., description="Probability of policy abolishment (%)")
    risk_category: str = Field(..., description="Low Risk, At Risk, or High Risk")

    total_country_co2_mt: float = Field(..., description="Total country CO2 emissions (Million tonnes)")
    co2_covered_mt: float = Field(..., description="CO2 covered by policy (Million tonnes)")
    co2_reduced_mt: float = Field(..., description="Potential CO2 reduction (Million tonnes)")
    co2_covered_per_capita_tonnes: float = Field(..., description="CO2 covered per capita (tonnes)")

    cars_off_road_equivalent: int = Field(..., description="Equivalent cars off road for 1 year")
    trees_planted_equivalent: int = Field(..., description="Equivalent trees planted for 1 year")
    coal_plants_closed_equivalent: float = Field(..., description="Equivalent 1GW coal plants closed")
    homes_powered_equivalent: int = Field(..., description="Equivalent homes powered clean for 1 year")
    equivalencies_source: str = Field(..., description="Brief source context for equivalency conversion factors")

    risk_adjusted_value_million: float = Field(..., description="Revenue adjusted for abolishment risk (Million USD)")

    recommendation: str = Field(..., description="Policy recommendation")
    similar_policies: List[str] = Field(..., description="List of similar real-world policies")
    key_risks: List[str] = Field(..., description="Key risks to policy success")
    context_explanation: str = Field(..., description="Detailed context explaining the prediction based on historical data")

    projections: List[YearProjection] = Field(..., description="Year-by-year projections")

class SimulationSummary(BaseModel):
    id: int
    policy_name: Optional[str]
    created_at: datetime
    country: str
    policy_type: str
    carbon_price_usd: float
    coverage_percent: float
    revenue_million: float
    risk_category: str
    
    class Config:
        from_attributes = True

class SimulationDetail(BaseModel):
    id: int
    user_id: int
    policy_name: Optional[str]
    created_at: datetime
    input_params: dict
    results: PredictionResponse
    
    class Config:
        from_attributes = True

class CompareSimulationsRequest(BaseModel):
    simulation_id_1: Optional[int] = None
    simulation_id_2: Optional[int] = None
    new_simulation_1: Optional[PredictionRequest] = None
    new_simulation_2: Optional[PredictionRequest] = None
