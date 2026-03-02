import Link from 'next/link';

interface AffiliateCTAProps {
  type: 'pension' | 'accountant' | 'mortgage' | 'tax-return';
  className?: string;
}

const ctaData = {
  pension: {
    title: 'Need help with your pension?',
    description: 'Talk to a qualified financial advisor about your retirement planning options, including My Future Fund auto-enrolment.',
    linkText: 'Find a pension advisor',
    href: '/about', // placeholder - will link to affiliate partner once signed up
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
    linkColor: 'text-emerald-700 hover:text-emerald-800',
  },
  accountant: {
    title: 'Looking for an accountant?',
    description: 'Get personalised tax advice from a qualified Irish accountant. Especially important for contractors and self-employed individuals.',
    linkText: 'Get tax advice',
    href: '/about',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    linkColor: 'text-blue-700 hover:text-blue-800',
  },
  mortgage: {
    title: 'Thinking of buying a home?',
    description: 'Understanding your after-tax income is the first step. Talk to a mortgage broker to see what you can afford.',
    linkText: 'Get mortgage advice',
    href: '/about',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
    linkColor: 'text-purple-700 hover:text-purple-800',
  },
  'tax-return': {
    title: 'Need to file your tax return?',
    description: 'Self-assessed taxpayers must file by October 31st. Get professional help to maximise your refund and avoid penalties.',
    linkText: 'File your return',
    href: '/about',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    linkColor: 'text-amber-700 hover:text-amber-800',
  },
};

export function AffiliateCTA({ type, className = '' }: AffiliateCTAProps) {
  const cta = ctaData[type];
  return (
    <div className={`rounded-xl border ${cta.borderColor} ${cta.bgColor} p-5 ${className}`}>
      <h3 className={`font-semibold ${cta.textColor} text-sm`}>{cta.title}</h3>
      <p className={`text-sm ${cta.textColor} mt-1 opacity-80`}>{cta.description}</p>
      <Link href={cta.href} className={`inline-block mt-2 text-sm font-medium ${cta.linkColor} underline`}>
        {cta.linkText} →
      </Link>
    </div>
  );
}
