import AutoEnrolmentCalculatorClient from './AutoEnrolmentCalculatorClient';

export const metadata = {
  title: 'Auto-enrolment calculator Ireland: should I opt out? (MyFutureFund) | MyIrishTax',
  description:
    'See what you, your employer and the State pay into MyFutureFund, when you can opt out, what you get back, and the things to weigh before you decide. Not advice.',
  alternates: { canonical: '/auto-enrolment-calculator' },
};

export default function Page() {
  return <AutoEnrolmentCalculatorClient />;
}
