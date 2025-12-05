# Tax Calculator UX Concepts

## Persona flow maps

### PAYE-only
- **Start:** Landing quick calculator.
- **Inputs:** Gross annual salary, county, age, marital/parental status.
- **Flow:**
  1) Quick result with effective + marginal rate.
  2) Prompt for pension %, medical insurance, BIK if user wants accuracy.
  3) Results page shows breakdown, credits, and comparison vs default (no pension) scenario.
  4) Offer save/share/export.

### PAYE + rental income
- **Start:** Landing quick calculator (PAYE tab preselected) with rental toggle.
- **Inputs:** Gross salary, county, age, marital/parental status; rental profit.
- **Flow:**
  1) Show combined effective/marginal rate with USC/PRSI/rental tax breakdown.
  2) Reveal advanced inputs for mortgage interest relief eligibility, pension %, medical insurance.
  3) Results show PAYE vs rental contribution, credits applied, scenario comparison (e.g., increased expenses).
  4) Offer save/share/export.

### Self-employed (Schedule D)
- **Start:** Landing quick calculator with self-employed option.
- **Inputs:** Gross trading income, county, age, marital/parental status.
- **Flow:**
  1) Quick estimate using standard allowances.
  2) Progressive disclosure for deductible expenses, pension %, private medical insurance, BIK (company car/van for mixed cases).
  3) Results highlight preliminary tax guidance and USC/PRSI/Income Tax split.
  4) Offer save/share/export.

### Mixed PAYE/self-employed
- **Start:** Quick calculator asks for PAYE salary and side-income toggle.
- **Inputs:** Gross salary, side trading income, county, age, marital/parental status.
- **Flow:**
  1) Immediate blended effective/marginal rate.
  2) Advanced inputs reveal pension %, medical insurance, BIK (from employer), and deductible expenses for self-employed portion.
  3) Results contrast employer deductions vs self-employed liabilities.
  4) Offer save/share/export.

### Pension-heavy (high AVC/PRSA)
- **Start:** Quick calculator with pension emphasis CTA ("show me tax if I increase pension").
- **Inputs:** Gross salary, pension %, county, age, marital/parental status.
- **Flow:**
  1) Immediate net income with pension deduction effect.
  2) Advanced inputs for BIK/medical insurance; sliders for pension % and max relief.
  3) Results compare current vs +5% and +10% pension scenarios.
  4) Offer save/share/export.

## Low-fidelity wireframes (text)

### Landing (value prop + CTA)
- **Hero:** Logo, headline ("Irish tax clarity in minutes"), subtext, primary CTA "Start calculating" plus secondary CTA "Advanced calculator".
- **Social proof:** Badges/testimonials row.
- **Quick calculator embed:** Gross income field, county dropdown, age, marital/parental selectors, calculate button.
- **Below fold:** Service highlights, automation hooks, footer links.

### Quick calculator
- **Fields:** Gross income, county, age, marital/parental status.
- **Buttons:** Calculate, "Try advanced" link.
- **Output card:** Effective rate, marginal rate, mini breakdown (USC/PRSI/Income Tax total), CTA to see full breakdown.

### Advanced calculator
- **Core inputs:** All quick fields.
- **Progressive disclosure panel:** Toggles/fields for pension %, medical insurance, BIK, rental profit, self-employed income, deductible expenses.
- **Actions:** Calculate button, save/share/export dropdown.
- **Helper text:** Relief limits, PRSI/USC notes.

### Results page with breakdown
- **Header:** Summary chips (net income, effective rate, marginal rate).
- **Breakdown columns:** Income Tax, USC, PRSI with amounts and rates.
- **Credits section:** Standard rate cut-off band usage, personal credits, PAYE credit, pension relief.
- **Charts (placeholder):** Bar/stacked bars for liability composition.
- **Actions:** Save/Share/Export buttons, "run what-if" link.

### "What-if" scenarios
- **Scenario selector:** Tabs/cards for default, higher pension, add rental income, adjust BIK.
- **Comparison table:** Net income, effective/marginal rate, USC/PRSI/Income Tax totals per scenario.
- **Toggle:** Highlight best net position.
- **Action:** Save/export scenario set.

## Progressive disclosure model
- **Initial ask (quick calculator):** Gross income, county, age, marital/parental status.
- **Advanced reveal triggers:** Click "Advanced" or "improve accuracy" to expand.
- **Advanced inputs:** Pension %, medical insurance premiums, BIK values, rental profit, self-employed income + expenses, mortgage interest relief toggle.
- **Guidance:** Inline tips on pension limits and USC/PRSI applicability.

## Results sections
- **Metrics:** Effective tax rate, marginal rate, net income.
- **Breakdown:** Separate totals for USC, PRSI, Income Tax with rate bands shown.
- **Credits:** Personal, PAYE, age, rental-related, pension relief noted.
- **Comparisons:** Default vs user-defined what-if scenarios (pension increase, income change, rental expenses shift).

## Save/share/export controls
- **Controls:** Persistent dropdown with PDF, CSV, and shareable link options; quick copy for link.
- **Placement:** Header of results and scenario comparison sections.
- **Behavior:** Uses same dataset as displayed breakdown; PDF/CSV include scenario summaries; shareable link encodes input state for retrieval.
