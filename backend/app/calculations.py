from .services import get_country_total_co2, get_country_population

def calculate_reduction_rate(carbon_price_usd):
    
    if carbon_price_usd < 30:
        return 0.03  
    elif carbon_price_usd < 60:
        return 0.05  
    elif carbon_price_usd < 100:
        return 0.08  
    else:
        return 0.12  

def calculate_co2_impact(coverage_pct, country, year, carbon_price_usd=50):
    total_co2_mt = get_country_total_co2(country, year)

    if total_co2_mt is None:
        return None

    co2_covered_mt = (coverage_pct / 100) * total_co2_mt
    co2_uncovered_mt = total_co2_mt - co2_covered_mt

    reduction_rate = calculate_reduction_rate(carbon_price_usd)
    co2_potentially_reduced_mt = co2_covered_mt * reduction_rate

    population = get_country_population(country, year)
    co2_covered_per_capita = (co2_covered_mt * 1_000_000) / population if population else 0

    return {
        'total_country_co2_mt': round(total_co2_mt, 1),
        'co2_covered_mt': round(co2_covered_mt, 1),
        'co2_covered_percent': round(coverage_pct, 1),
        'co2_uncovered_mt': round(co2_uncovered_mt, 1),
        'co2_uncovered_percent': round(100 - coverage_pct, 1),
        'co2_potentially_reduced_mt': round(co2_potentially_reduced_mt, 2),
        'co2_covered_per_capita_tonnes': round(co2_covered_per_capita, 3),
        'reduction_rate_used': reduction_rate,
        'carbon_price_usd': carbon_price_usd,
        'disclaimer': f'Potential reduction based on {int(reduction_rate*100)}% rate for ${carbon_price_usd}/tonne carbon price (literature-based estimate). Actual reductions depend on policy design, enforcement quality, and sector compliance.'
    }

def calculate_equivalencies(co2_reduced_mt):
    co2_reduced_tonnes = co2_reduced_mt * 1_000_000

    return {
        'cars_off_road_1year': int(co2_reduced_tonnes / 4.6),
        'trees_planted_1year': int(co2_reduced_tonnes / 0.06),
        'coal_plants_closed': round(co2_reduced_mt / 3.5, 2),
        'homes_powered_clean_1year': int(co2_reduced_tonnes / 8.3)
    }
