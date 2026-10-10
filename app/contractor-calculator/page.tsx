import ContractorCalculatorClient from './ContractorCalculatorClient';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Sole trader / self-employed tax calculator (Class S) | MyIrishTax',
  description:
    'Sole trader or self-employed in Ireland? Estimate income tax, USC and Class S PRSI on your profit, plus preliminary tax due 31 October (18 November if you pay and file on ROS). Estimate only; not financial or tax advice.',
  path: '/contractor-calculator',
});

export default function Page() {
  return <ContractorCalculatorClient />;
}
