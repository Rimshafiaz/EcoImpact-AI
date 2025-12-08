# EcoImpact AI - Data Preprocessing Decisions

## Decision Log
*Track all preprocessing choices and rationale*

---

## ✅ Decision 1: Dataset Selection
**Choice**: Option B - Core 4 Datasets
**Date**: [Current Date]

## ✅ Step 1: Data Loading
**Status**: Complete ✅
**Date**: [Current Date]

### Loading Configuration:
- `gen_info`: skiprows=4 (header at row 4: "Unique ID")
- `emissions`: skiprows=2 (header at row 2: "Name of the initiative") 
- `price`: skiprows=1 (header at row 1: "Unique ID")
- `revenue`: skiprows=1 (header at row 1: "Instrument name")

### Data Successfully Loaded:
- General Info: 131 policies × 44 columns
- Emissions: 91 policies × 37 columns  
- Price: 80 policies × 42 columns
- Revenue: 92 policies × 41 columns

### Selected Files:
1. `data_08_2025_Compliance_Gen_Info.csv` (131 policies, metadata)
2. `data_08_2025_Compliance_Emissions.csv` (91 policies, emission coverage %)
3. `data_08_2025_Compliance_Price.csv` (80 policies, carbon prices US$/tCO2e)
4. `data_08_2025_Compliance_Revenue.csv` (92 policies, government revenue US$M)

### Rationale:
- Complete environmental + economic simulation capability
- Manageable complexity for initial model
- Can add carbon credit datasets later for enhanced features

### Key Constraints:
- Different policy counts across datasets (need alignment)
- Revenue data ends 2024, others go to 2025
- Zeros are meaningful (policy exists, no activity)

---

## ✅ Decision 2: Policy Selection Strategy
**Choice**: Option A - Conservative Approach
**Date**: [Current Date]

### Selected Approach:
Keep only policies present in ALL 4 datasets (78 policies)

### Policy Matching Results:
- Gen Info: 131 policies
- Emissions: 91 policies  
- Price: 80 policies
- Revenue: 92 policies
- **Overlap in all 4**: 78 policies

### Rationale:
- Complete data for environmental + economic modeling
- No complex missing value handling needed
- High-quality, reliable dataset for initial model
- Sufficient size for ML training (78 policies)

### Examples of Selected Policies:
Nova Scotia OBPS, UK ETS, Slovenia carbon tax, Luxembourg carbon tax, Sweden carbon tax

---

## ✅ Step 2: Exploratory Data Analysis
**Status**: Complete ✅
**Date**: [Current Date]

### Key Findings:
- Missing values follow historical patterns (not data quality issues)
- Emissions dataset: 0% missing (excellent)
- Price dataset: 61.3% missing (expected for carbon pricing history)
- Revenue dataset: 59.4% missing (realistic for government data)
- Strong policy name alignment across datasets

---

## ✅ Decision 3: Dataset Merging and Master Dataset Creation
**Choice**: Safe Step-by-Step Merging
**Date**: [Current Date]

### Merging Strategy:
- Started with Gen Info as base dataset (78 policies)
- Merged Emissions using policy name matching
- Merged Price data with suffix handling
- Merged Revenue data (corrected column name issue)
- Applied integrity checks at each step

### Technical Details:
- Used inner joins to maintain data quality
- Verified no data loss at each merge step
- Handled different column naming conventions
- Final dataset: 78 policies × ~150+ columns

### Result:
Master dataset successfully created and saved to `../dataset/processed/master_dataset.csv`

---

## ✅ Decision 4: Geographic Scope Strategy
**Choice**: Global Approach - Keep All Policies
**Date**: [Current Date]

### Rationale:
- More training data improves model performance
- Regional diversity helps model learn different contexts
- Provides user flexibility for any region simulation
- No additional preprocessing complexity

### Impact on Simulation:
- Model trained on diverse global policy experience
- Users can specify region as input parameter
- Better generalization across different economic contexts

---

## ✅ Step 3: Master Dataset Creation
**Status**: Complete ✅
**Date**: [Current Date]

### Achievements:
- Successfully merged all 4 core datasets
- Maintained data integrity throughout process
- Created unified dataset with complete information
- Saved processed dataset for future use

### Next Steps:
- Feature engineering and ML preparation
- Model training and validation
- Simulation interface development

---

## ✅ Step 4: Master Dataset EDA
**Status**: Complete ✅
**Date**: [Current Date]

### Categorical Features Analysis:
- **Type**: Perfect balance (39 Carbon Tax, 39 ETS)
- **Status**: 67 Implemented (86%), 11 Abolished (14%)
- **Region**: Europe (27), North America (22), East Asia (18), Others (11)
- **Income Group**: High income (56), Upper middle (22)
- **Jurisdiction**: 68 unique (too granular - will use Region instead)

### Time Series Patterns:
- **1990s**: 6.4% non-zero (early carbon pricing era)
- **2000s**: 12.4% non-zero (Kyoto Protocol period)
- **2010s**: 43.3% non-zero (Paris Agreement expansion)
- **2020s**: 79.9% non-zero (current boom)
- **Total**: 859 positive values for ML training

### Regional Policy Preferences:
- **Europe**: Prefers Carbon Tax (20 vs 7 ETS), 100% implementation success
- **East Asia**: Prefers ETS (16 vs 2 Carbon Tax), 94% success rate
- **North America**: Prefers ETS (15 vs 7 Carbon Tax), 59% success rate (political volatility)
- **Latin America**: Prefers Carbon Tax (8 vs 1 ETS)

### Key Insights:
- Balanced dataset enables unbiased ML training
- Strong recent data (2020s) perfect for current policy simulation
- Regional patterns clear for region-specific recommendations
- Economic development strongly correlates with carbon pricing adoption

---

## ✅ Decision 5: Categorical Feature Selection
**Choice**: Use Region, Drop Jurisdiction
**Date**: [Current Date]

### Rationale:
- Jurisdiction has 68 unique values (too granular for ML)
- Most jurisdictions have only 1 policy (insufficient training data)
- Region provides better generalization (6 categories with good sample sizes)

### Final Categorical Features for ML:
- Type (2 categories)
- Status (2 categories)
- Region (6 categories)
- Income group (2 categories)

---

## ✅ Decision 6: Time Period Strategy
**Choice**: Use Full Period (1990-2025)
**Date**: [Current Date]

### Rationale:
- Captures complete policy lifecycle evolution
- Recent data (2020s) has 79.9% coverage (excellent)
- Historical context helps model understand policy development patterns
- Missing early data reflects reality (few policies existed)

---

## Implementation Notes
*Key technical details for preprocessing*

### Completed:
- ✅ Policy name matching across datasets
- ✅ Dataset merging with integrity checks
- ✅ Zero vs missing value distinction validated
- ✅ Data type consistency verified
- ✅ Temporal alignment confirmed

### Next Phase - Feature Engineering:
- [ ] Encode categorical variables (Type, Status, Region, Income group)
- [ ] Create target variables (emission coverage, price, revenue predictions)
- [ ] Prepare feature matrix for ML
- [ ] Split train/test sets
- [ ] Save processed features

---

*Last Updated: [Current Date]*
*Current Status: Ready for Feature Engineering*