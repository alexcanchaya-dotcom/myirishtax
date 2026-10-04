import RentTaxCreditClient from './RentTaxCreditClient';

export const metadata = {
  title: 'Rent tax credit: calculator and how to claim in myAccount | MyIrishTax',
  description:
    'Check your rent tax credit for 2022 to 2026 and claim it in Revenue myAccount, step by step, for this year or past years. Up to €1,000, or €2,000 for a couple. Based on published rates; not advice.',
  alternates: { canonical: '/rent-tax-credit' },
};

export default function Page() {
  return <RentTaxCreditClient />;
}
