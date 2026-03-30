import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDIC Smart Split Optimizer | Truva',
  description: 'Optimize your savings across banks with PDIC insurance.',
};

export default function OptimizerPage() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold mb-4 text-brand-textPrimary">PDIC Optimizer</h1>
      <p className="text-brand-textSecondary">Coming in Week 4.</p>
    </div>
  );
}
