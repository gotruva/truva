import Link from 'next/link';
import { SignOutButton } from '@/components/admin/SignOutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Truva <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 text-sm font-medium">
          <nav className="flex-1 space-y-1 mt-4">
            <Link
              href="/admin"
              className="group flex items-center rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/admin/rates/review"
              className="group flex items-center rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Review Queue
            </Link>
            <Link
              href="/admin/rates/catalog"
              className="group flex items-center rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Rate Catalog
            </Link>
            <Link
              href="/admin/mmf"
              className="group flex items-center rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              MMF Management
            </Link>
            <Link
              href="/admin/snapshots"
              className="group flex items-center rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Snapshots & Rollbacks
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
}
