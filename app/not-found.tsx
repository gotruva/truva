import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-brand-primary uppercase mb-4">404</p>
      <h1 className="text-3xl font-bold text-brand-textPrimary dark:text-gray-100 mb-3">Page not found</h1>
      <p className="text-brand-textSecondary dark:text-gray-400 mb-8 max-w-sm">
        This page doesn&apos;t exist. Head back to compare rates.
      </p>
      <Link
        href="/"
        className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-primaryDark transition-colors"
      >
        Back to Truva →
      </Link>
    </div>
  );
}
