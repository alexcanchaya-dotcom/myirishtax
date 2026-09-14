import { LegalArticle } from '@/components/LegalArticle';

export const metadata = {
  title: 'Disclaimer | MyIrishTax',
  description: 'MyIrishTax calculators are based on published Irish tax bands and are not advice.',
};

export default function DisclaimerPage() {
  return (
    <LegalArticle badge="Disclaimer" title="Disclaimer">
      <p>
        Based on published Irish tax bands; not advice. The calculators and articles on MyIrishTax
        are for information only. They are not a substitute for advice from a qualified tax advisor
        who knows your situation.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">What this means</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Results depend on the figures you enter and the published bands we have coded.</li>
        <li>Your actual Revenue bill can differ (other income, reliefs, or payroll settings).</li>
        <li>Using the site does not create a client relationship.</li>
        <li>Always check current rates on Revenue.ie before you file.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
      <p>
        Questions:{' '}
        <a href="mailto:support@myirishtax.com" className="text-brand-600 hover:underline">
          support@myirishtax.com
        </a>
        . Registered company details on request.
      </p>
    </LegalArticle>
  );
}
