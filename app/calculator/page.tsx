import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Yield Calculator | Truva',
  description: 'Calculate your after-tax savings yield.',
};

export default function CalculatorPage() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold mb-4 text-brand-textPrimary">Yield Calculator</h1>
      <p className="text-brand-textSecondary">Coming in Week 3.</p>
    </div>
  );
}
