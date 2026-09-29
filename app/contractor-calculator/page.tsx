import ContractorCalculatorClient from './ContractorCalculatorClient';

export const metadata = {
  title: 'Irish contractor tax calculator | MyIrishTax',
  description:
    'Estimate income tax, USC and Class S PRSI for self-employed contractors in Ireland, after expenses and pension contributions. Based on published Irish tax bands; not advice.',
  alternates: { canonical: '/contractor-calculator' },
};

export default function Page() {
  return <ContractorCalculatorClient />;
}
