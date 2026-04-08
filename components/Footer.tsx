import Link from 'next/link';
import Image from 'next/image';
import { PartnerCTA } from '@/components/PartnerCTA';

export function Footer() {
  const verificationCopy = 'Rates are checked and verified regularly. Returns shown after 20% Final Withholding Tax unless marked tax-exempt. This is not financial advice.';

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-brand-border dark:border-white/10 mt-auto pt-12 pb-8 px-4 md:px-8 text-center text-[13px] text-brand-textSecondary dark:text-gray-400 transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/truva-logo-blue.png"
            alt="Truva"
            width={134}
            height={36}
            className="block h-8 w-auto dark:hidden grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
          />
          <Image
            src="/truva-logo-white.png"
            alt="Truva"
            width={134}
            height={36}
            className="hidden h-8 w-auto dark:block opacity-60 hover:opacity-100 transition-all"
          />
        </Link>
        
        <div className="flex flex-col gap-3">
          <p>{verificationCopy}</p>
          <p className="font-semibold text-brand-textPrimary dark:text-gray-200">
            Truva.ph is an independent comparison service. We may receive compensation from our partner institutions when you click on links or open accounts. This compensation does not influence our objective rate calculations.
          </p>

          <PartnerCTA />

          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors">
              Terms & Conditions
            </Link>
          </div>

          <p className="mt-2">
            &copy; {new Date().getFullYear()} Truva. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
