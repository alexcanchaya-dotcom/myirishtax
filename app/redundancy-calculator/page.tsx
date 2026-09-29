import RedundancyCalculatorClient from './RedundancyCalculatorClient';

export const metadata = {
  title: 'Irish redundancy calculator | MyIrishTax',
  description:
    'Estimate statutory redundancy pay and the tax on an Irish redundancy package, including pay in lieu of notice and holiday pay. Based on published Irish rules; not advice.',
  alternates: { canonical: '/redundancy-calculator' },
};

export default function Page() {
  return <RedundancyCalculatorClient />;
}
