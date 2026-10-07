/**
 * Rates label and "checked" date shown in the trust strip on every calculator and guide.
 * One place to change: when Budget 2027 (#39) ships, set RATES_LABEL to 'Budget 2027 rates'
 * and RATES_CHECKED to the date the 2027 figures were checked against Revenue and gov.ie.
 */
import { BUDGET_2027 } from './taxYear2027';

const BUDGET_2027_LIVE = BUDGET_2027.status === 'confirmed';
export const RATES_LABEL = BUDGET_2027_LIVE ? 'Budget 2027 rates' : '2026 rates';
export const RATES_CHECKED = BUDGET_2027_LIVE && BUDGET_2027.figuresCheckedOn ? BUDGET_2027.figuresCheckedOn : '7 Oct 2026';

export type SourceLink = { label: string; href: string };

export const REVENUE_RATES: SourceLink = {
  label: 'Revenue',
  href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx',
};
export const GOV_PRSI_CLASS_A: SourceLink = {
  label: 'gov.ie',
  href: 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates/',
};
export const GOV_PRSI_CLASS_S: SourceLink = {
  label: 'gov.ie',
  href: 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-pay-related-social-insurance/',
};

export const DEFAULT_SOURCES: SourceLink[] = [REVENUE_RATES, GOV_PRSI_CLASS_A];
