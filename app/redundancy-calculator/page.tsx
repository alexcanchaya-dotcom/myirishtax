import RedundancyCalculatorClient from './RedundancyCalculatorClient';

export const metadata = {
  title: 'Redundancy calculator Ireland: how much is tax-free? | MyIrishTax',
  description:
    'Estimate your statutory redundancy and the tax-free part of an Irish redundancy package: basic exemption, increased exemption and SCSB. Based on published Irish tax bands; not advice.',
  alternates: { canonical: '/redundancy-calculator' },
};

export default function Page() {
  return <RedundancyCalculatorClient />;
}
