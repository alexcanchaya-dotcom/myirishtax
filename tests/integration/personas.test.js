import { describe, expect, it } from 'vitest';
import fixtures from '../fixtures/tax-fixtures.json';
import { buildExportSummary, calculateTaxResult } from '../../src/assets/calculator.js';
import { createUpsellIntent, getDebugStore, scheduleReminder, startOnboarding } from '../../src/automations/workflows.js';

describe('persona integration flows', () => {
  it('validates golden fixtures for each tax year', () => {
    Object.entries(fixtures).forEach(([taxYear, personas]) => {
      personas.forEach((entry) => {
        const result = calculateTaxResult(entry.input);
        expect(result.paye).toBeCloseTo(entry.expected.paye, 2);
        expect(result.usc).toBeCloseTo(entry.expected.usc, 2);
        expect(result.prsi).toBeCloseTo(entry.expected.prsi, 2);
        const summary = buildExportSummary(result, Number(taxYear));
        expect(summary.metadata.disclaimer).toContain('Illustrative');
      });
    });
  });

  it('covers onboarding-to-upsell journey for PAYE persona', async () => {
    const onboarding = await startOnboarding({ email: 'taxpayer@example.com', filingType: 'PAYE' });
    await scheduleReminder({ email: onboarding.email, type: 'onboarding', delayHours: 12 });
    await createUpsellIntent({ email: onboarding.email, service: 'PAYE review' });

    const store = getDebugStore();
    const latestIntent = store.find((record) => record.id.startsWith('upsell-'));
    expect(latestIntent.service).toBe('PAYE review');
  });
});
