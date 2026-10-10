import RedundancyCalculatorClient from './RedundancyCalculatorClient';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Redundancy calculator Ireland: how much is tax-free? | MyIrishTax',
  description:
    'Estimate your statutory redundancy and the tax-free part of an Irish redundancy package: basic exemption, increased exemption and SCSB. Based on published Irish tax bands; not advice.',
  path: '/redundancy-calculator',
});

export default function Page() {
  return <RedundancyCalculatorClient />;
}
