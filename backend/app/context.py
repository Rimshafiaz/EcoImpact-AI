import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR.parent.parent / "dataset"

training_data = None
COUNTRIES_WITH_HISTORICAL_DATA = []

def load_training_data():
    global training_data, COUNTRIES_WITH_HISTORICAL_DATA

    clean_data = DATA_DIR / "processed" / "ecoimpact_clean_for_retraining.csv"
    if not clean_data.exists():
        raise FileNotFoundError(f"Required dataset not found: {clean_data}")
    
    training_data = pd.read_csv(clean_data)
    COUNTRIES_WITH_HISTORICAL_DATA = training_data['Jurisdiction'].unique().tolist()

def is_country_in_training(country):
    return country in COUNTRIES_WITH_HISTORICAL_DATA

def generate_success_context(country, policy_type, predicted_risk_pct, risk_category, region=None):
    if country not in COUNTRIES_WITH_HISTORICAL_DATA:
        region_text = f"{region}" if region else "the region"
        context_message = (
            f"{country} has no historical record of implementing carbon pricing policies in our training dataset. "
            f"This absence of prior experience introduces significant uncertainty. The risk assessment is based on "
            f"regional patterns from {region_text}, economic development level, and energy structure factors, "
            f"but lacks country-specific validation."
        )

        recommendation = "Limited data - proceed with caution."

        return {
            'has_historical_data': False,
            'context_message': context_message,
            'confidence': 'Low',
            'recommendation': recommendation
        }



    from .mappings import get_income_level
    income_level = get_income_level(country)
    region_text = f"{region}" if region else "the region"

    if risk_category == "Low Risk":
        context_msg = f'The model predicts Low Risk for {country}. This assessment is based on the country\'s {income_level} economic status, favorable regional patterns from {region_text} where similar policies have shown strong sustainability, and current economic conditions. The model indicates low probability of policy failure based on these regional and economic factors.'
        recommendation = 'Favorable conditions for policy implementation.'

    elif risk_category == "High Risk":
        context_msg = f'The model predicts High Risk for {country}. This assessment is based on challenging regional patterns in {region_text} where similar policies have a history of not surviving, combined with economic and energy structure factors. The model indicates significant risk of policy failure based on these regional and economic conditions.'
        recommendation = 'Significant challenges identified.'

    else: 
        context_msg = f'The model predicts At Risk for {country}. This moderate risk level is based on mixed regional outcomes in {region_text}, the country\'s {income_level} economic status, and current energy/economic factors. The assessment indicates uncertainty - success is possible but faces moderate challenges based on regional patterns and economic conditions.'
        recommendation = 'Moderate risk - careful implementation required.'

    return {
        'has_historical_data': True,
        'context_message': context_msg,
        'confidence': 'High',
        'recommendation': recommendation
    }

def calculate_benchmarking(user_coverage_pct, user_revenue, user_carbon_price, region):
    historical = training_data[training_data['Region'] == region]

    if len(historical) == 0:
        return None

    coverage_percentile = (historical['Actual_Coverage_%'] < user_coverage_pct).mean() * 100
    revenue_percentile = (historical['Revenue_Million_USD'] < user_revenue).mean() * 100
    price_percentile = (historical['Carbon_Price_USD'] < user_carbon_price).mean() * 100

    avg_coverage = historical['Actual_Coverage_%'].mean()
    avg_revenue = historical['Revenue_Million_USD'].mean()
    avg_price = historical['Carbon_Price_USD'].mean()

    coverage_vs_avg = ((user_coverage_pct / avg_coverage - 1) * 100) if avg_coverage > 0 else 0
    revenue_vs_avg = ((user_revenue / avg_revenue - 1) * 100) if avg_revenue > 0 else 0
    price_vs_avg = ((user_carbon_price / avg_price - 1) * 100) if avg_price > 0 else 0

    return {
        'coverage_rank': f"Top {100 - coverage_percentile:.0f}%",
        'revenue_rank': f"Top {100 - revenue_percentile:.0f}%",
        'price_rank': f"Top {100 - price_percentile:.0f}%",
        'vs_regional_avg': {
            'coverage': round(coverage_vs_avg, 1),
            'revenue': round(revenue_vs_avg, 1),
            'price': round(price_vs_avg, 1)
        },
        'regional_stats': {
            'avg_coverage': round(avg_coverage, 1),
            'avg_revenue': round(avg_revenue, 1),
            'avg_price': round(avg_price, 1),
            'total_policies': len(historical)
        }
    }

def calculate_risk_adjusted_revenue(revenue_usd, abolishment_probability):
    success_probability = 1 - abolishment_probability

    expected_revenue_conservative = revenue_usd * success_probability
    expected_revenue_optimistic = revenue_usd * (success_probability + 0.5 * abolishment_probability)

    risk_discount = revenue_usd - expected_revenue_conservative

    return {
        'base_revenue': round(revenue_usd, 2),
        'expected_value': round(expected_revenue_conservative, 2),
        'optimistic_scenario': round(expected_revenue_optimistic, 2),
        'risk_discount': round(risk_discount, 2),
        'success_probability': round(success_probability * 100, 1)
    }

def generate_context(country, policy_type, carbon_price, coverage_pct, revenue, abolishment_risk, risk_category, region=None):
    if training_data is None:
        load_training_data()

    success_ctx = generate_success_context(country, policy_type, abolishment_risk, risk_category, region)

    recommendation = success_ctx['recommendation']

    similar_policies = []
    if training_data is not None and region:
        similar_regional = training_data[
            (training_data['Type'] == policy_type) &
            (training_data['Status'] == 'Implemented') &
            (training_data['Region'] == region)
        ].copy()

        coverage_col = 'Actual_Coverage_%' if 'Actual_Coverage_%' in training_data.columns else 'Emission_Coverage_%'

        if len(similar_regional) > 0:
            similar_regional['price_diff'] = abs(similar_regional['Carbon_Price_USD'].fillna(0) - carbon_price)
            similar_regional['coverage_diff'] = abs(similar_regional[coverage_col].fillna(0) - coverage_pct)
            similar_regional['similarity'] = similar_regional['price_diff'] + similar_regional['coverage_diff']

            top_similar = similar_regional.nsmallest(3, 'similarity')

            for _, row in top_similar.iterrows():
                policy_str = f"{row['Jurisdiction']} {policy_type} ({row.get('Year', 'N/A')}): "
                policy_str += f"${row['Carbon_Price_USD']:.0f}/tonne, {row[coverage_col]:.1f}% coverage"
                similar_policies.append(policy_str)

        elif len(similar_policies) < 3:
            similar = training_data[
                (training_data['Type'] == policy_type) &
                (training_data['Status'] == 'Implemented')
            ].copy()

            if len(similar) > 0:
                similar['price_diff'] = abs(similar['Carbon_Price_USD'].fillna(0) - carbon_price)
                similar['coverage_diff'] = abs(similar[coverage_col].fillna(0) - coverage_pct)
                similar['similarity'] = similar['price_diff'] + similar['coverage_diff']

                top_similar = similar.nsmallest(3, 'similarity')

                for _, row in top_similar.iterrows():
                    policy_str = f"{row['Jurisdiction']} {policy_type} ({row.get('Year', 'N/A')}): "
                    policy_str += f"${row['Carbon_Price_USD']:.0f}/tonne, {row[coverage_col]:.1f}% coverage (from {row['Region']})"
                    similar_policies.append(policy_str)

    if len(similar_policies) == 0:
        similar_policies = [f"No directly comparable {policy_type.lower()} policies found in historical data"]

    key_risks = []

    if abolishment_risk > 50:
        key_risks.append("High political resistance to carbon pricing")

    if country in COUNTRIES_WITH_HISTORICAL_DATA:
        country_history = training_data[training_data['Jurisdiction'] == country]
        abolished_count = (country_history['Status'] == 'Abolished').sum()
        if abolished_count > 0:
            key_risks.append(f"Historical precedent: {abolished_count} previous policies abolished in {country}")

    if coverage_pct > 70:
        key_risks.append("High coverage may face resistance from affected industries")

    if carbon_price > 50:
        key_risks.append("High carbon price may trigger political opposition")

    if len(key_risks) == 0:
        key_risks = ["Moderate implementation and enforcement challenges expected"]

    return {
        'recommendation': recommendation,
        'similar_policies': similar_policies,
        'key_risks': key_risks,
        'success_context': success_ctx
    }
