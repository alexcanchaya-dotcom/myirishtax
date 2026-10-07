import { listSupportedYears } from './config/taxYearConfig';

/** Take-home calculator inputs that go in the page URL so an estimate can be reloaded or shared. */
export type HomeUrlState = {
  income: number;
  period: 'annual' | 'monthly' | 'weekly';
  maritalStatus: 'single' | 'married';
  spouseIncome: number;
  pension: number;
  pensionAge: string;
  credits: number;
  taxYear: number;
};

const num = (v: string | null): number | undefined => {
  if (v === null || v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Reads ?income=&period=&status=&spouse=&pension=&age=&credits=&year= ; bad or missing values keep the defaults. */
export function fromSearch(search: string, defaults: HomeUrlState): HomeUrlState {
  const p = new URLSearchParams(search);
  const period = p.get('period');
  const status = p.get('status');
  const year = num(p.get('year'));
  const age = num(p.get('age'));
  return {
    income: num(p.get('income')) ?? defaults.income,
    period: period === 'annual' || period === 'monthly' || period === 'weekly' ? period : defaults.period,
    maritalStatus: status === 'single' || status === 'married' ? status : defaults.maritalStatus,
    spouseIncome: num(p.get('spouse')) ?? defaults.spouseIncome,
    pension: num(p.get('pension')) ?? defaults.pension,
    pensionAge: age !== undefined && Number.isInteger(age) && age >= 16 && age <= 120 ? String(age) : defaults.pensionAge,
    credits: num(p.get('credits')) ?? defaults.credits,
    taxYear: year !== undefined && listSupportedYears().includes(year) ? year : defaults.taxYear,
  };
}

/** Only values that differ from the defaults go in the URL, so the plain homepage stays "/". */
export function toSearch(s: HomeUrlState, defaults: HomeUrlState): string {
  const p = new URLSearchParams();
  if (s.income !== defaults.income) p.set('income', String(s.income));
  if (s.period !== defaults.period) p.set('period', s.period);
  if (s.maritalStatus !== defaults.maritalStatus) p.set('status', s.maritalStatus);
  if (s.maritalStatus === 'married' && s.spouseIncome > 0) p.set('spouse', String(s.spouseIncome));
  if (s.pension !== defaults.pension) p.set('pension', String(s.pension));
  if (s.pensionAge !== '' && s.pensionAge !== defaults.pensionAge) p.set('age', s.pensionAge);
  if (s.credits !== defaults.credits) p.set('credits', String(s.credits));
  if (s.taxYear !== defaults.taxYear) p.set('year', String(s.taxYear));
  const q = p.toString();
  return q ? `?${q}` : '';
}
