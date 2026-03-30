import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time Deposit Tracker | Truva',
  description: 'Track your time deposits and get maturity alerts.',
};

export default function TrackerPage() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold mb-4 text-brand-textPrimary">TD Tracker</h1>
      <p className="text-brand-textSecondary">Coming in Week 6.</p>
    </div>
  );
}
