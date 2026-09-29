import AutoEnrolmentCalculatorClient from './AutoEnrolmentCalculatorClient';

export const metadata = {
  title: 'Auto-enrolment pension calculator (My Future Fund) | MyIrishTax',
  description:
    'See what you, your employer and the State would pay into the Irish My Future Fund auto-enrolment pension from January 2026, with a rough estimate of the pot at retirement. Not advice.',
  alternates: { canonical: '/auto-enrolment-calculator' },
};

export default function Page() {
  return <AutoEnrolmentCalculatorClient />;
}
