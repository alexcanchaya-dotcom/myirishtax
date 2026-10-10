import AutoEnrolmentCalculatorClient from './AutoEnrolmentCalculatorClient';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Auto-enrolment calculator Ireland: should I opt out? (MyFutureFund) | MyIrishTax',
  description:
    'See what you, your employer and the State pay into MyFutureFund, when you can opt out, what you get back, and the things to weigh before you decide. Not advice.',
  path: '/auto-enrolment-calculator',
});

export default function Page() {
  return <AutoEnrolmentCalculatorClient />;
}
