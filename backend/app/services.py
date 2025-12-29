import pandas as pd
from pathlib import Path
from .mappings import get_region, get_income_level

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR.parent.parent / "dataset"

energy_data = None
gdp_data = None
population_data = None
co2_data = None

def load_all_data():
    global energy_data, gdp_data, population_data, co2_data

    energy_data = pd.read_csv(DATA_DIR / "energy mix dataset" / "per-capita-energy-stacked.csv")
    gdp_data = pd.read_csv(DATA_DIR / "gdp data" / "gdp-penn-world-table.csv")
    population_data = pd.read_csv(DATA_DIR / "population dataset" / "population.csv")
    co2_data = pd.read_csv(DATA_DIR / "annual_co2_per_country" / "annual-co2-emissions-per-country.csv")

def get_country_features(country: str, year: int):
    region = get_region(country)
    income_group = get_income_level(country)
    fossil_fuel_pct = get_country_fossil_fuel_pct(country, year)
    population = get_country_population(country, year)
    gdp = get_country_gdp(country, year)

    return {
        'region': region,
        'income_group': income_group,
        'fossil_fuel_pct': fossil_fuel_pct,
        'population': population,
        'gdp': gdp
    }

def get_country_fossil_fuel_pct(country: str, year: int) -> float:
    data = energy_data[(energy_data['Entity'] == country) & (energy_data['Year'] == year)]

    if data.empty:
        country_data = energy_data[energy_data['Entity'] == country]
        if not country_data.empty:
            data = country_data.sort_values('Year', ascending=False).head(1)

    if data.empty:
        return 70.0

    row = data.iloc[0]

    coal = row.get('Coal (kWh per capita)', 0) or 0
    oil = row.get('Oil (kWh per capita)', 0) or 0
    gas = row.get('Gas (kWh per capita)', 0) or 0

    total_cols = ['Primary energy (kWh per capita)', 'Total (kWh per capita)', 'Total energy (kWh per capita)']
    total = 0
    for col in total_cols:
        if col in row.index:
            total = row[col] or 0
            break

    if total == 0:
        nuclear = row.get('Nuclear (kWh per capita)', 0) or 0
        hydro = row.get('Hydro (kWh per capita)', 0) or 0
        wind = row.get('Wind (kWh per capita)', 0) or 0
        solar = row.get('Solar (kWh per capita)', 0) or 0
        other = row.get('Other renewables (kWh per capita)', 0) or 0
        total = coal + oil + gas + nuclear + hydro + wind + solar + other

    if total == 0:
        return 70.0

    fossil_pct = ((coal + oil + gas) / total) * 100
    return round(fossil_pct, 2)

def get_country_gdp(country: str, year: int) -> float:
    data = gdp_data[(gdp_data['Entity'] == country) & (gdp_data['Year'] == year)]

    if data.empty:
        country_data = gdp_data[gdp_data['Entity'] == country]
        if not country_data.empty:
            data = country_data.sort_values('Year', ascending=False).head(1)

    if data.empty:
        alternate_names = {
            'United States': 'United States of America',
            'Russia': 'Russian Federation',
            'South Korea': 'Republic of Korea',
            'Iran': 'Islamic Republic of Iran',
        }

        if country in alternate_names:
            alt_country = alternate_names[country]
            data = gdp_data[(gdp_data['Entity'] == alt_country) & (gdp_data['Year'] == year)]

    if data.empty:
        raise ValueError(f"GDP data not found for {country}")

    gdp_intl = data['GDP (output, multiple price benchmarks)'].values[0]
    gdp_million = gdp_intl / 1_000_000

    return round(gdp_million, 2)

def get_country_population(country: str, year: int) -> int:
    data = population_data[(population_data['Entity'] == country) & (population_data['Year'] == year)]

    if data.empty:
        country_data = population_data[population_data['Entity'] == country]
        if not country_data.empty:
            data = country_data.sort_values('Year', ascending=False).head(1)

    if data.empty:
        raise ValueError(f"Population data not found for {country}")

    population = int(data['all years'].values[0])
    return population

def get_country_total_co2(country: str, year: int) -> float:
    data = co2_data[(co2_data['Entity'] == country) & (co2_data['Year'] == year)]

    if data.empty:
        country_data = co2_data[co2_data['Entity'] == country]
        if not country_data.empty:
            data = country_data.sort_values('Year', ascending=False).head(1)

    if data.empty:
        raise ValueError(f"CO2 data not found for {country}")

    co2_tonnes = data['Annual CO₂ emissions'].values[0]
    co2_million_tonnes = co2_tonnes / 1_000_000

    return round(co2_million_tonnes, 2)

def get_available_countries():
    if energy_data is None:
        load_all_data()

    energy_countries = set(energy_data['Entity'].unique())
    gdp_countries = set(gdp_data['Entity'].unique())
    population_countries = set(population_data['Entity'].unique())
    co2_countries = set(co2_data['Entity'].unique())

    complete_countries = energy_countries & gdp_countries & population_countries & co2_countries

    return sorted(list(complete_countries))
