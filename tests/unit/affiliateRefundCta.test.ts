import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AffiliateRefundCTA } from '../../components/AffiliateRefundCTA';
import { affiliateUrl } from '../../lib/monetisation/placements';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');
const render = (env: Record<string, string | undefined>) =>
  renderToStaticMarkup(React.createElement(AffiliateRefundCTA, { page: 'emergency-tax', env }));

describe('AffiliateRefundCTA (off by default)', () => {
  it('renders nothing with no flag, flag off, no URL, or a non-https URL', () => {
    expect(render({})).toBe('');
    expect(render({ NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: 'https://partner.example/x' })).toBe('');
    expect(render({ NEXT_PUBLIC_AFFILIATE_ENABLED: 'false', NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: 'https://partner.example/x' })).toBe('');
    expect(render({ NEXT_PUBLIC_AFFILIATE_ENABLED: 'true' })).toBe('');
    expect(render({ NEXT_PUBLIC_AFFILIATE_ENABLED: 'true', NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: 'http://partner.example/x' })).toBe('');
    expect(render({ NEXT_PUBLIC_AFFILIATE_ENABLED: 'true', NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: 'not a url' })).toBe('');
  });

  it('with flag and URL: #Ad label, sponsored nofollow, commission note', () => {
    const html = render({ NEXT_PUBLIC_AFFILIATE_ENABLED: 'true', NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: 'https://partner.example/x' });
    expect(html).toContain('href="https://partner.example/x"');
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('#Ad');
    expect(html).toContain('We may earn a commission if you use this service.');
    expect(html).not.toMatch(/<script|we recommend/i);
  });

  it('this build has no affiliate env set, so it is off', () => {
    expect(affiliateUrl({})).toBeNull();
    expect(process.env.NEXT_PUBLIC_AFFILIATE_ENABLED).toBeUndefined();
  });

  it('is placed on the refund pages, after the free Revenue content', () => {
    expect(read('app/emergency-tax-ireland/page.tsx')).toContain('<AffiliateRefundCTA page="emergency-tax" />');
    expect(read('app/second-income-form-12/page.tsx')).toContain('<AffiliateRefundCTA page="second-income" />');
    expect(read('app/rent-tax-credit/page.tsx')).toContain('<AffiliateRefundCTA page="rent-credit" />');
  });
});
