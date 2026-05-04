import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Truva',
  description:
    'Truva helps Filipinos compare savings, money market funds, credit cards, and loans with clearer math and less fine-print hunting.',
};

const principles = [
  'Show net returns and important conditions close to the decision.',
  'Separate live product data from preview frameworks.',
  'Make partner disclosure visible without turning the site into an ad wall.',
];

export default function AboutPage() {
  return (
    <main className="bg-[#F6F8FC] px-4 py-16 text-brand-textPrimary dark:bg-slate-950 dark:text-gray-100 md:px-8 md:py-24">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-brand-primary">About Truva</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#07111f] dark:text-white sm:text-5xl">
          We are building the Philippine comparison desk we wanted to use ourselves.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300">
          Truva helps people compare money products without opening five tabs, guessing whether a rate is gross or net, or losing the fine print that changes the decision.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {principles.map((principle) => (
            <article key={principle} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-brand-border dark:bg-white/[0.04] dark:ring-white/10">
              <p className="text-base font-semibold leading-relaxed">{principle}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/banking/rates#rate-desk"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-primary px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            Open the rate desk
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/articles"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-brand-border bg-white px-5 text-sm font-semibold text-brand-textPrimary transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-100 dark:focus-visible:ring-offset-slate-950"
          >
            Read the blog
          </Link>
        </div>
      </section>
    </main>
  );
}
