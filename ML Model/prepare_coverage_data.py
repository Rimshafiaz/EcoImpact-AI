"""
COMPREHENSIVE COVERAGE DATA PREPARATION PIPELINE
"""

import pandas as pd
import numpy as np


print("SECTION 1: COVERAGE DATASET EXPLORATION")


coverage_df = pd.read_csv(r'C:\Users\HP\Desktop\fyp\docs\Ecoimpact -AI\dataset\CO2_coverage\carbon-tax-trading-coverage.csv')
coverage_df.columns = ['Entity', 'Code', 'Year', 'Total_Coverage_%', 'Tax_Coverage_%', 'ETS_Coverage_%']

print(f"\nDataset Overview:")
print(f"  Total rows: {len(coverage_df):,}")
print(f"  Entities: {coverage_df['Entity'].nunique()}")
print(f"  Year range: {coverage_df['Year'].min()} - {coverage_df['Year'].max()}")

non_zero = coverage_df[coverage_df['Total_Coverage_%'] > 0].copy()
print(f"\nCoverage Statistics (non-zero rows: {len(non_zero):,}):")
print(f"  Min:    {non_zero['Total_Coverage_%'].min():.2f}%")
print(f"  Max:    {non_zero['Total_Coverage_%'].max():.2f}%")
print(f"  Mean:   {non_zero['Total_Coverage_%'].mean():.2f}%")
print(f"  Median: {non_zero['Total_Coverage_%'].median():.2f}%")
print(f"  Std:    {non_zero['Total_Coverage_%'].std():.2f}%")

print(f"\nTop 5 countries by latest coverage:")
latest_year = coverage_df.groupby('Entity')['Year'].max().reset_index()
latest_data = coverage_df.merge(latest_year, on=['Entity', 'Year'])
latest_with_coverage = latest_data[latest_data['Total_Coverage_%'] > 0].sort_values('Total_Coverage_%', ascending=False)

for i, row in latest_with_coverage.head(5).iterrows():
    print(f"  {row['Entity']:30s} ({row['Year']}): {row['Total_Coverage_%']:5.1f}%")


print("SECTION 2: CREATING EU AGGREGATE")


eu27_countries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
    'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden'
]

print(f"\nEU27 member countries: {len(eu27_countries)}")

coverage_entities = coverage_df['Entity'].unique()
eu_in_coverage = [country for country in eu27_countries if country in coverage_entities]
eu_missing = [country for country in eu27_countries if country not in coverage_entities]

print(f"Found: {len(eu_in_coverage)} / {len(eu27_countries)} EU countries")
if len(eu_missing) > 0:
    print(f"Missing: {', '.join(eu_missing)}")

eu_coverage_data = coverage_df[coverage_df['Entity'].isin(eu_in_coverage)].copy()

eu_aggregate = eu_coverage_data.groupby('Year').agg({
    'Total_Coverage_%': 'mean',
    'Tax_Coverage_%': 'mean',
    'ETS_Coverage_%': 'mean'
}).reset_index()

eu_aggregate['Entity'] = 'EU'
eu_aggregate['Code'] = 'EU'

eu_aggregate = eu_aggregate[['Entity', 'Code', 'Year', 'Total_Coverage_%', 'Tax_Coverage_%', 'ETS_Coverage_%']]

print(f"\nEU aggregate created: {len(eu_aggregate)} years")
print(f"  Mean Total Coverage: {eu_aggregate['Total_Coverage_%'].mean():.2f}%")
print(f"  Coverage in 2024: {eu_aggregate[eu_aggregate['Year'] == 2024]['Total_Coverage_%'].values[0]:.2f}%")

coverage_with_eu = pd.concat([coverage_df, eu_aggregate], ignore_index=True)

print(f"\nEnhanced coverage dataset: {len(coverage_with_eu):,} rows ({len(coverage_with_eu['Entity'].unique())} entities)")

output_path_eu = r'C:\Users\HP\Desktop\fyp\docs\Ecoimpact -AI\dataset\CO2_coverage\carbon-tax-trading-coverage-with-EU.csv'
coverage_with_eu.to_csv(output_path_eu, index=False)
print(f"[SAVED] {output_path_eu}")


print("SECTION 3: 3-TIER LOOKUP STRATEGY")


print("""
Strategy (same as used for Energy Mix, Population, CO2, GDP datasets):
  TIER 1: Parent country mapping (sub-national regions -> parent country)
  TIER 2: Special cases (naming mismatches)
  TIER 3: Direct match
""")

training_df = pd.read_csv(r'C:\Users\HP\Desktop\fyp\docs\Ecoimpact -AI\dataset\processed\ecoimpact_complete_dataset.csv')

print(f"Training dataset: {len(training_df):,} rows, {training_df['Jurisdiction'].nunique()} jurisdictions")

subnational_regions = {
    'Canada': ['Alberta', 'British Columbia', 'Quebec', 'Ontario', 'New Brunswick',
               'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
               'Prince Edward Island', 'Saskatchewan'],

    'United States': ['California', 'Massachusetts', 'Oregon', 'Washington', 'RGGI'],

    'China': ['Beijing', 'Shanghai', 'Chongqing', 'Fujian', 'Guangdong (except Shenzhen)',
              'Hubei', 'Shenzhen', 'Tianjin'],

    'Japan': ['Tokyo', 'Saitama'],

    'Mexico': ['Baja California', 'Tamaulipas', 'Zacatecas']
}

parent_country_map = {}
for parent, regions in subnational_regions.items():
    for region in regions:
        parent_country_map[region] = parent

print(f"\nTIER 1: Parent country mapping")
print(f"  Sub-national regions: {len(parent_country_map)}")
for parent, regions in subnational_regions.items():
    print(f"    {parent}: {len(regions)} regions")

special_cases = {
    'EU': 'EU',
    'EU27+': 'EU',
    'Korea, Rep.': 'South Korea'
}

print(f"\nTIER 2: Special cases")
for old, new in special_cases.items():
    print(f"  {old} -> {new}")

def get_lookup_entity_coverage(jurisdiction):
    if jurisdiction in parent_country_map:
        return parent_country_map[jurisdiction]

    if jurisdiction in special_cases:
        return special_cases[jurisdiction]

    return jurisdiction

print(f"\nTIER 3: Direct match (all other jurisdictions)")

training_df['Lookup_Entity'] = training_df['Jurisdiction'].apply(get_lookup_entity_coverage)

print(f"\nLookup applied:")
print(f"  Original jurisdictions: {training_df['Jurisdiction'].nunique()}")
print(f"  Unique lookup entities: {training_df['Lookup_Entity'].nunique()}")

print(f"\nExample mappings:")
samples = [('Alberta', 'Canada'), ('California', 'United States'), ('Beijing', 'China'),
           ('EU', 'EU'), ('Germany', 'Germany'), ('Korea, Rep.', 'South Korea')]
for jur, expected in samples:
    if jur in training_df['Jurisdiction'].values:
        lookup = get_lookup_entity_coverage(jur)
        print(f"  {jur:25s} -> {lookup:25s} {'(mapped)' if jur != lookup else '(direct)'}")


print("SECTION 4: MERGING DATASETS")


df_merged = training_df.merge(
    coverage_with_eu[['Entity', 'Year', 'Tax_Coverage_%', 'ETS_Coverage_%']],
    left_on=['Lookup_Entity', 'Year'],
    right_on=['Entity', 'Year'],
    how='left'
)

print(f"\nAfter merge: {len(df_merged):,} rows")

def get_actual_coverage(row):
    if row['Type'] == 'Carbon tax' and pd.notna(row['Tax_Coverage_%']):
        return row['Tax_Coverage_%']
    elif row['Type'] == 'ETS' and pd.notna(row['ETS_Coverage_%']):
        return row['ETS_Coverage_%']
    else:
        return row.get('Emission_Coverage_%', np.nan)

df_merged['Actual_Coverage_%'] = df_merged.apply(get_actual_coverage, axis=1)

has_actual = df_merged['Actual_Coverage_%'].notna()
print(f"\nRows with coverage data: {has_actual.sum():,} ({has_actual.sum()/len(df_merged)*100:.1f}%)")

df_complete = df_merged[
    (df_merged['Actual_Coverage_%'].notna()) &
    (df_merged['Actual_Coverage_%'] > 0) &
    (df_merged['Revenue_Million_USD'].notna()) &
    (df_merged['Carbon_Price_USD'].notna()) &
    (df_merged['Fossil_Fuel_Dependency_%'].notna()) &
    (df_merged['Population'].notna()) &
    (df_merged['GDP'].notna()) &
    (df_merged['Type'].notna()) &
    (df_merged['Region'].notna()) &
    (df_merged['Income group'].notna())
].copy()

print(f"\nComplete data for retraining: {len(df_complete):,} rows")
print(f"  Unique jurisdictions: {df_complete['Jurisdiction'].nunique()}")
print(f"  Year range: {df_complete['Year'].min()} - {df_complete['Year'].max()}")

print(f"\n{'='*80}")
print("SECTION 5: RESULTS & COMPARISON")
print("="*80)

print(f"\nNew Coverage Statistics:")
print(f"  Min:    {df_complete['Actual_Coverage_%'].min():.2f}%")
print(f"  Max:    {df_complete['Actual_Coverage_%'].max():.2f}%")
print(f"  Mean:   {df_complete['Actual_Coverage_%'].mean():.2f}%")
print(f"  Median: {df_complete['Actual_Coverage_%'].median():.2f}%")
print(f"  Std:    {df_complete['Actual_Coverage_%'].std():.2f}%")

old_coverage = training_df[training_df['Emission_Coverage_%'].notna()]['Emission_Coverage_%']

print(f"\nOLD vs NEW Comparison:")
print(f"  OLD Range:  {old_coverage.min():.4f}% - {old_coverage.max():.4f}%")
print(f"  NEW Range:  {df_complete['Actual_Coverage_%'].min():.2f}% - {df_complete['Actual_Coverage_%'].max():.2f}%")
print(f"  OLD Std:    {old_coverage.std():.4f}%")
print(f"  NEW Std:    {df_complete['Actual_Coverage_%'].std():.2f}%")

variance_improvement = (df_complete['Actual_Coverage_%'].std() / old_coverage.std())
print(f"\n  Variance Improvement: {variance_improvement:.1f}x better!")

print(f"\nCoverage by Region:")
regional_coverage = df_complete.groupby('Region').agg({
    'Actual_Coverage_%': ['count', 'mean', 'min', 'max']
}).round(2)
print(regional_coverage.to_string())

print(f"\nTop 10 Jurisdictions by Average Coverage:")
top_jurisdictions = df_complete.groupby('Jurisdiction').agg({
    'Actual_Coverage_%': 'mean',
    'Revenue_Million_USD': 'mean',
    'Year': 'count'
}).rename(columns={'Year': 'N'}).sort_values('Actual_Coverage_%', ascending=False).head(10)

for jurisdiction, row in top_jurisdictions.iterrows():
    print(f"  {jurisdiction:30s} Cov: {row['Actual_Coverage_%']:5.1f}%, Rev: ${row['Revenue_Million_USD']:8.1f}M, N: {int(row['N'])}")


print("SECTION 6: SAVING DATASETS")


output_path_full = r'C:\Users\HP\Desktop\fyp\docs\Ecoimpact -AI\dataset\processed\ecoimpact_with_actual_coverage.csv'
df_merged.to_csv(output_path_full, index=False)
print(f"\n[SAVED] Full merged dataset: {output_path_full}")
print(f"  Rows: {len(df_merged):,}")

output_path_clean = r'C:\Users\HP\Desktop\fyp\docs\Ecoimpact -AI\dataset\processed\ecoimpact_clean_for_retraining.csv'
df_complete.to_csv(output_path_clean, index=False)
print(f"[SAVED] Clean dataset for retraining: {output_path_clean}")
print(f"  Rows: {len(df_complete):,}")


print("SUMMARY")


print(f"""
PROBLEM SOLVED:
  - Original coverage range: 0.07-4.27% (insufficient variance)
  - New coverage range: {df_complete['Actual_Coverage_%'].min():.1f}%-{df_complete['Actual_Coverage_%'].max():.1f}% (excellent variance)
  - Variance improvement: {variance_improvement:.1f}x

DATASETS CREATED:
  1. Enhanced coverage dataset with EU aggregate (7,308 rows)
  2. Full merged dataset (2,808 rows)
  3. Clean retraining dataset (548 rows, all features complete)

NEXT STEPS:
  1. Run retrain_with_coverage.py to retrain models WITH coverage as feature
  2. Update backend to accept coverage_percent input parameter
  3. Update frontend to include coverage slider (10-90%)

This enables users to simulate policies with realistic coverage scenarios (20-80%)
without model extrapolation issues!
""")


