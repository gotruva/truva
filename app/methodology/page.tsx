import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Compare Financial Products',
  description: 'Learn about Truva\'s editorial standards, how we calculate after-tax yields, and how we make money.',
  alternates: {
    canonical: '/methodology',
  },
};

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-8">How We Rate & Compare</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-brand-textSecondary mb-8">
          At Truva, our mission is to help Filipinos maximize their hard-earned money. We believe financial comparison should be transparent and mathematically honest.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">The &quot;After-Tax First&quot; Promise</h2>
        <p>
          Most banks advertise their gross interest rates. For example, a 5% p.a. savings account might sound great, but in the Philippines, a 20% Final Withholding Tax (FWT) is automatically deducted from your interest. Your actual take-home rate is only 4%.
        </p>
        <p>
          We automatically calculate and prominently display the definitive <strong>after-tax yield</strong> for every single product on our platform, so you can compare &quot;apples to apples&quot; between standard banks, tax-exempt government bonds (like MP2 or T-Bills), and digital cooperatives.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Editorial Independence</h2>
        <p>
          Truva is an independent platform built by a solo founder. While we may earn a referral commission if you open an account through our links, our comparison engines, calculators, and rankings are driven exclusively by math, public rates, and terms, not by highest-paying affiliates.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Data Verification</h2>
        <p>
          We rely on public announcements, the Bureau of the Treasury (BTr), Pag-IBIG updates, and bank websites to ensure our database is accurate. Every product listing on Truva is stamped with a &quot;Last Verified&quot; date so you know exactly when the data was checked.
        </p>
      </div>
    </div>
  );
}
