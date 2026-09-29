import RentTaxCreditClient from './RentTaxCreditClient';

export const metadata = {
  title: 'Rent tax credit calculator | MyIrishTax',
  description:
    'Check how much Irish rent tax credit you may be able to claim for 2022 to 2026, as a single person or jointly assessed couple. Based on published rates; not advice.',
  alternates: { canonical: '/rent-tax-credit' },
};

export default function Page() {
  return <RentTaxCreditClient />;
}
