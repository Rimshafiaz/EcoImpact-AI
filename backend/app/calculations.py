from .services import get_country_total_co2, get_country_population

def calculate_reduction_rate(carbon_price_usd):
    price_points = [
        (0, 0.03),
        (30, 0.03),
        (60, 0.05),
        (100, 0.08),
        (150, 0.12),
    ]
    
    if carbon_price_usd <= 0:
        return 0.03
    if carbon_price_usd >= 150:
        return min(0.12, 0.15)
    
    for i in range(len(price_points) - 1):
        price_low, rate_low = price_points[i]
        price_high, rate_high = price_points[i + 1]
        
        if price_low <= carbon_price_usd < price_high:
            if price_high == price_low:
                return rate_low
            ratio = (carbon_price_usd - price_low) / (price_high - price_low)
            rate = rate_low + (rate_high - rate_low) * ratio
            return min(rate, 0.15)
    
    return min(0.12, 0.15)  

def calculate_co2_impact(coverage_pct, country, year, carbon_price_usd=50):
    total_co2_mt = get_country_total_co2(country, year)

    if total_co2_mt is None:
        return None
    
    if total_co2_mt <= 0:
        return None

    co2_covered_mt = (coverage_pct / 100) * total_co2_mt
    co2_uncovered_mt = total_co2_mt - co2_covered_mt

    reduction_rate = calculate_reduction_rate(carbon_price_usd)
    co2_potentially_reduced_mt = co2_covered_mt * reduction_rate
    
    max_reasonable_reduction = co2_covered_mt * 0.20
    co2_potentially_reduced_mt = min(co2_potentially_reduced_mt, max_reasonable_reduction)
    
    if co2_potentially_reduced_mt < 0.01:
        co2_potentially_reduced_mt = 0.01

    population = get_country_population(country, year)
    co2_covered_per_capita = (co2_covered_mt * 1_000_000) / population if population else 0

    return {
        'total_country_co2_mt': round(total_co2_mt, 1),
        'co2_covered_mt': round(co2_covered_mt, 1),
        'co2_covered_percent': round(coverage_pct, 1),
        'co2_uncovered_mt': round(co2_uncovered_mt, 1),
        'co2_uncovered_percent': round(100 - coverage_pct, 1),
        'co2_potentially_reduced_mt': round(co2_potentially_reduced_mt, 3),
        'co2_covered_per_capita_tonnes': round(co2_covered_per_capita, 3),
        'reduction_rate_used': reduction_rate,
        'carbon_price_usd': carbon_price_usd,
        'disclaimer': f'Potential reduction based on {int(reduction_rate*100)}% rate for ${carbon_price_usd}/tonne carbon price (literature-based estimate). Actual reductions depend on policy design, enforcement quality, and sector compliance.'
    }

def calculate_equivalencies(co2_reduced_mt):
    if co2_reduced_mt is None or co2_reduced_mt <= 0:
        return {
            'cars_off_road_1year': 0,
            'trees_planted_1year': 0,
            'coal_plants_closed': 0.0,
            'homes_powered_clean_1year': 0,
            'source_context': 'Conversion factors based on EPA Greenhouse Gas Equivalencies Calculator: 4.6 tons/vehicle, 0.06 tons/tree/year, 3.5M tons/1GW coal plant, 7.87 tons/home/year. Sources: EPA, USDA Forest Service, IEA.'
        }
    
    co2_reduced_tonnes = co2_reduced_mt * 1_000_000
    
    CO2_PER_CAR_TONNES = 4.6
    CO2_PER_TREE_TONNES = 0.06
    CO2_PER_COAL_PLANT_MT = 3.5
    CO2_PER_HOME_TONNES = 7.87
    
    return {
        'cars_off_road_1year': max(0, int(co2_reduced_tonnes / CO2_PER_CAR_TONNES)),
        'trees_planted_1year': max(0, int(co2_reduced_tonnes / CO2_PER_TREE_TONNES)),
        'coal_plants_closed': max(0.0, round(co2_reduced_mt / CO2_PER_COAL_PLANT_MT, 2)),
        'homes_powered_clean_1year': max(0, int(co2_reduced_tonnes / CO2_PER_HOME_TONNES)),
        'source_context': 'Conversion factors based on EPA Greenhouse Gas Equivalencies Calculator: 4.6 tons/vehicle, 0.06 tons/tree/year, 3.5M tons/1GW coal plant, 7.87 tons/home/year. Sources: EPA, USDA Forest Service, IEA.'
    }
