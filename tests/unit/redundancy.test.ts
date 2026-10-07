import { calculateRedundancy } from '../../lib/redundancy2025';

// Revenue Tax and Duty Manual Part 05-05-19 worked examples, and the audit live-check case.
const AVG_95K_OVER_3Y = 95000 / 3; // TDM: "pay for the final 36 months of employment was €95,000"

describe('statutory redundancy: 2 weeks per year + 1, weekly pay capped at €600, tax-free', () => {
  it('€52,000, 10 years → 21 × €600 = €12,600', () => {
    expect(calculateRedundancy({ annualSalary: 52000, yearsService: 10 }).statutoryRedundancy).toBe(12600);
  });

  it('TDM John: 18 years → (18 × 2 × 600) + 600 = €22,200', () => {
    expect(calculateRedundancy({ annualSalary: AVG_95K_OVER_3Y, yearsService: 18 }).statutoryRedundancy).toBe(22200);
  });

  it('under 2 years of service: no statutory redundancy', () => {
    expect(calculateRedundancy({ annualSalary: 52000, yearsService: 1 }).statutoryRedundancy).toBe(0);
  });
});

describe('TDM 05-05-19 "Amount Chargeable to Tax (Redundancy Package)" — John', () => {
  // Non-statutory €40,000 + statutory €22,200 + company car €4,000 (entered as part of the package);
  // non-contractual PILON €765; tax-free pension lump sum €7,000.
  const r = calculateRedundancy({
    annualSalary: AVG_95K_OVER_3Y,
    yearsService: 18,
    packageAmount: 40000 + 22200 + 4000,
    pilon: 765,
    pilonContractual: false,
    hasPension: true,
    pensionLumpSum: 7000,
  });

  it('lump sum €44,765', () => expect(r.exGratiaLumpSum).toBeCloseTo(44765, 2));
  it('basic €23,930, increased €26,930, SCSB €31,000', () => {
    expect(r.exemptions.basic).toBe(23930);
    expect(r.exemptions.increased).toBe(26930);
    expect(r.exemptions.scsb).toBeCloseTo(31000, 2);
  });
  it('SCSB is best; taxable €13,765', () => {
    expect(r.bestMethod).toBe('scsb');
    expect(r.taxFreeLumpSum).toBeCloseTo(31000, 2);
    expect(r.taxableLumpSum).toBeCloseTo(13765, 2);
  });
});

describe('TDM 05-05-19 "Amount Chargeable to Tax" — Jenny (pension lump sum €11,000 > €10,000)', () => {
  it('increased gives nothing extra; SCSB €27,000; taxable €33,000 of a €60,000 ex-gratia sum', () => {
    const statutory = calculateRedundancy({ annualSalary: AVG_95K_OVER_3Y, yearsService: 18 }).statutoryRedundancy;
    const r = calculateRedundancy({
      annualSalary: AVG_95K_OVER_3Y,
      yearsService: 18,
      packageAmount: 60000 + statutory,
      hasPension: true,
      pensionLumpSum: 11000,
    });
    expect(r.exGratiaLumpSum).toBeCloseTo(60000, 2);
    expect(r.exemptions.increased).toBe(23930);
    expect(r.exemptions.scsb).toBeCloseTo(27000, 2);
    expect(r.taxableLumpSum).toBeCloseTo(33000, 2);
  });
});

describe('Live check case: €52,000 salary, 10 years, €60,000 package', () => {
  const r = calculateRedundancy({ annualSalary: 52000, yearsService: 10, packageAmount: 60000 });

  it('uses the package: ex-gratia €47,400 after €12,600 statutory', () => {
    expect(r.exGratiaLumpSum).toBeCloseTo(47400, 2);
  });

  it('basic €17,810 (TDM Anna example), increased €27,810, SCSB €34,666.67 → SCSB is best', () => {
    expect(r.exemptions.basic).toBe(17810);
    expect(r.exemptions.increased).toBe(27810);
    expect(r.exemptions.scsb).toBeCloseTo(34666.67, 2);
    expect(r.bestMethod).toBe('scsb');
  });

  it('taxable €12,733.33; at 40% income tax + 3% USC and no PRSI = €5,475.33', () => {
    expect(r.taxableLumpSum).toBeCloseTo(12733.33, 2);
    expect(r.lumpSumIncomeTax).toBeCloseTo(5093.33, 2);
    expect(r.lumpSumUsc).toBeCloseTo(382, 2);
    expect(r.totalTax).toBeCloseTo(5475.33, 2);
    expect(r.netPackage).toBeCloseTo(54524.67, 2);
  });

  it('basic exemption only (audit figure): €60,000 − €12,600 − €17,810 = €29,590 when SCSB and increased are lower', () => {
    // With no service-based SCSB advantage (salary €20,000: SCSB €13,333) and a prior claim above basic:
    const b = calculateRedundancy({
      annualSalary: 20000,
      yearsService: 10,
      packageAmount: 60000 - 12600 + calculateRedundancy({ annualSalary: 20000, yearsService: 10 }).statutoryRedundancy,
      claimedAboveBasicLast10Years: true,
    });
    expect(b.bestMethod).toBe('basic');
    expect(b.taxableLumpSum).toBeCloseTo(29590, 2);
  });
});

describe('PILON, holiday pay and the lifetime limit', () => {
  it('contractual PILON is pay: income tax 40%, USC 3% and PRSI (2026 4.2375%) at €52,000', () => {
    const r = calculateRedundancy({ annualSalary: 52000, yearsService: 10, pilon: 5000 });
    expect(r.exGratiaLumpSum).toBe(0);
    expect(r.pilonTax).toBeCloseTo(2361.88, 2); // 5,000 × (40% + 3% + 4.2375%) = 2,361.875
  });

  it('non-contractual PILON joins the lump sum and can be tax-free', () => {
    const r = calculateRedundancy({ annualSalary: 52000, yearsService: 10, pilon: 5000, pilonContractual: false });
    expect(r.exGratiaLumpSum).toBe(5000);
    expect(r.taxableLumpSum).toBe(0);
    expect(r.pilonTax).toBe(0);
  });

  it('€200,000 lifetime limit less relief already used', () => {
    const r = calculateRedundancy({ annualSalary: 52000, yearsService: 10, packageAmount: 60000, priorReliefUsed: 190000 });
    expect(r.taxFreeLumpSum).toBe(10000);
    expect(r.taxableLumpSum).toBeCloseTo(37400, 2);
    expect(r.lifetimeCapApplied).toBe(true);
  });
});
