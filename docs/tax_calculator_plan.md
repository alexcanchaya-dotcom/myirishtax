# Tax Calculator Module Plan (Ireland 2024)

This document maps the calculators needed for the Irish tax experience, describes how to separate rates into versioned configs, outlines “what-if” scenario tooling, and prioritises phase 1 vs phase 2 work.

## Module map (calculators / engines)
- **PAYE income tax with credits**
  - Inputs: gross pay, pay frequency, tax credits (personal/PAYE/home carer/rent), standard-rate band based on status, LPT/other deductions.
  - Outputs: tax at 20% / 40%, credits applied, net pay.
  - Config-driven rate bands and credits.
- **Universal Social Charge (USC)**
  - Inputs: taxable income (post pension/PRSA), medical card/de-exemption flags.
  - Outputs: USC by band, surcharge for self-employed income > €100,000.
- **PRSI (Class A primary employer/employee)**
  - Inputs: gross pay, weekly thresholds, PRSI credit taper, employer thresholds.
  - Outputs: EE 4% with credit relief, ER 8.8%/11.05% depending on weekly earnings.
- **Pension contributions**
  - Inputs: employee PRSA/occupational contributions, employer contributions.
  - Outputs: tax relief eligibility by age band and earnings cap; ER contributions separate for BIK and PRSI.
- **Benefits-in-kind (BIK)**
  - Company car (ICE/EV) using OMV, CO₂ category, business kilometres, and EV OMV deduction.
  - Medical/dental insurance grossed up; other benefits valued at market value or Revenue rules.
- **Rental income**
  - Inputs: gross rent, RTB registration flag, qualifying expenses, interest, pre-letting upgrades.
  - Outputs: taxable rental profit, wear-and-tear allowances, separate PAYE/self-assessment routing.
- **Self-employed / trading income**
  - Inputs: net profit, capital allowances, preliminary tax basis selection (100% prior year / 90% current year / ROS direct debit 105% two years prior).
  - Outputs: income tax + USC + PRSI class S, preliminary tax due dates.
- **Capital allowances**
  - Inputs: qualifying assets (plant & machinery, industrial buildings), cost, first-use date.
  - Outputs: annual allowance schedules (e.g., 12.5% over 8 years for plant, 4% over 25 years for industrial buildings), balancing charges/allowances on disposal.
- **CGT estimator (phase 2)**
  - Inputs: disposal proceeds, acquisition cost, enhancement costs, allowable losses, relief flags (PRR, retirement relief, entrepreneur relief).
  - Outputs: chargeable gain, annual exemption, CGT at 33% (10% entrepreneur relief where valid), payment date guidance.

## Config-driven rates
- Store tax-year data under `config/tax_years/<year>.yml` (e.g., `config/tax_years/2024.yml`).
- Config should expose: income tax bands/credits, USC bands, PRSI thresholds/credits, pension relief limits, BIK tables, rental rules, self-employed prelim tax options, capital allowance rates, CGT rates/exemption, and metadata for sources/versions.
- Runtime logic picks the latest year by default but can accept an override to run historical or future “what-if” scenarios.

## What-if scenario runner
- Accept multiple income sources (PAYE salary/bonus, rental, self-employed, other benefits) plus contribution levels (PRSA/occupational EE+ER, AVCs).
- Sensitivity toggles: vary pension contributions, adjust benefits (e.g., company car OMV or EV deduction), toggle marital status and band transfer, switch medical card/USC exemption flags, change PRSI class where relevant, and include/exclude rental expenses.
- Persist scenarios as named presets; allow side-by-side comparison of net pay, effective rate, marginal rate, and cash impact of toggles.
- Allow batch runs (e.g., contribution levels from 0% to 10% in 1% steps) to show marginal savings.

## Data sources and yearly update process
- Primary references: Revenue eBriefs, Tax and Duty Manuals (PAYE/BIK/USC/PRSI), Budget 2024 summary, Finance Act 2023/2024, ROS guidance on preliminary tax, and USC/PRSI exemption thresholds for medical card or pensioners.
- Update process (annually in Q4 when Budget is announced):
  1) Create new config file under `config/tax_years/<new_year>.yml` by cloning the prior year.
  2) Refresh figures from Revenue publications; capture links in the `sources` block of the config.
  3) Run unit tests/regression scenarios for common personas (single, married dual income, self-employed, landlord, EV company car).
  4) Publish release notes summarising rate changes and scenario diffs.

## MVP (phase 1) scope
- PAYE + credits, USC, PRSI Class A, pension relief checks, company car BIK (including EV deduction), rental income with key expenses, self-employed income with preliminary tax options, capital allowances for plant/equipment, what-if runner for PAYE + pension + BIK + rental.

## Backlog (phase 2)
- CGT estimator, fringe/edge PRSI classes, complex BIK rules (pooled cars, vans, preferential loans), share schemes, detailed loss utilisation, high-earner USC surcharge edge cases, landlord-specific reliefs (RRS, rent-a-room), and full capital allowance balancing charge calculations.
