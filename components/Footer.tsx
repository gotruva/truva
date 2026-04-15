import Link from 'next/link';
import Image from 'next/image';
import { PartnerCTA } from '@/components/PartnerCTA';

export function Footer() {
  const verificationCopy =
    'Rates are checked regularly. Banking returns are shown after 20% Final Withholding Tax unless marked tax-exempt. Nothing on Truva is personal financial advice.';

  return (
    <footer className="mt-auto border-t border-brand-border bg-white px-4 pb-8 pt-12 text-center text-[13px] text-brand-textSecondary transition-colors duration-300 dark:border-white/10 dark:bg-slate-950 dark:text-gray-400 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <Link href="/" className="flex items-center shrink-0 transition-opacity hover:opacity-80">
          <Image
            src="/truva-logo-blue.png"
            alt="Truva"
            width={134}
            height={36}
            className="block h-8 w-auto grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 dark:hidden"
          />
          <Image
            src="/truva-logo-white.png"
            alt="Truva"
            width={134}
            height={36}
            className="hidden h-8 w-auto opacity-60 transition-all hover:opacity-100 dark:block"
          />
        </Link>

        <div className="space-y-3">
          <p>{verificationCopy}</p>
          <p className="font-semibold text-brand-textPrimary dark:text-gray-200">
            Truva may receive compensation from partners when readers click through or take action on partner sites. That can affect advertisements and partner-supported placements. It should not change editorial opinions or future True Value Score methodology.
          </p>
        </div>

        <PartnerCTA />

        <div className="grid w-full gap-6 text-left sm:grid-cols-3">
          <FooterGroup
            title="Products"
            links={[
              { href: '/banking', label: 'Banking' },
              { href: '/credit-cards', label: 'Credit Cards' },
              { href: '/loans', label: 'Loans' },
            ]}
          />
          <FooterGroup
            title="Methodology"
            links={[
              { href: '/methodology', label: 'Trust Hub' },
              { href: '/methodology/banking', label: 'Banking Methodology' },
              { href: '/methodology/credit-cards', label: 'Card Methodology' },
              { href: '/methodology/loans', label: 'Loans Methodology' },
              { href: '/methodology/editorial-integrity', label: 'Editorial Integrity' },
            ]}
          />
          <FooterGroup
            title="Company"
            links={[
              { href: '/articles', label: 'Articles' },
              { href: '/guides', label: 'Guides' },
              { href: '/terms', label: 'Terms & Conditions' },
            ]}
          />
        </div>

        <p>&copy; {new Date().getFullYear()} Truva. All rights reserved.</p>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-brand-textPrimary dark:hover:text-gray-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
