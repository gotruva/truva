import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle,
  Heart,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Truva: Our Mission and Core Promises',
  description:
    'Truva is a free, clear and simple comparison platform built to help Filipinos compare savings, credit cards, and insurance with clearer math and zero fine-print hunting.',
  alternates: {
    canonical: '/about',
  },
};

const principles = [
  {
    title: 'Honest and Unbiased Numbers',
    description: 'Whether it\'s savings interest, credit card cashback, or insurance premiums, we show the numbers exactly as they are. We do not use hidden calculations or complex tricks to change the facts. What you see is what you get, with all conditions made clear.',
    icon: TrendingUp,
  },
  {
    title: 'We Always Highlight the "Catch"',
    description: 'Almost every financial product has rules, like a minimum spending limit, a lock-in period, or high annual fees. We search the fine print and show these conditions upfront so you are never surprised.',
    icon: AlertTriangle,
  },
  {
    title: 'Free and Transparent Forever',
    description: 'Truva is completely free for everyone. We do not show annoying ad walls or sell your data. Instead, we earn a fee from companies if you choose to apply using our link. This never changes the rate or deal you are offered.',
    icon: Sparkles,
  },
];

const targetUsers = [
  {
    title: 'Growing Your Money',
    description: 'You have money sitting in a standard account or mobile wallet. You know it could earn more elsewhere, but you do not have the time to research and filter through dozens of different options.',
    image: '/images/first_time_saver.png',
  },
  {
    title: 'Taking the Next Big Step',
    description: 'You are hitting a milestone, such as choosing your first credit card, getting travel insurance, or comparing borrowing costs. You want to quickly verify if you are getting a fair deal without the guesswork.',
    image: '/images/life_transitioner.png',
  },
  {
    title: 'Starting from the Basics',
    description: 'You are completely new to tools like credit card cashbacks, lock-in periods, or insurance premiums. You want explanations in simple, everyday language to understand how things work without the intimidating jargon.',
    image: '/images/financial_beginner.png',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-brand-surface text-brand-textPrimary dark:bg-slate-950 dark:text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 md:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary dark:bg-brand-primary/20">
            About Truva
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#07111f] dark:text-white sm:text-5xl md:text-6xl md:leading-[1.1] text-balance">
            We build tools that make personal finance <span className="text-brand-primary">clear, honest, and simple</span> for every Filipino
          </h1>
          <p className="mt-8 text-base leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-lg md:text-xl max-w-[65ch]">
            Comparing financial products in the Philippines is harder than it should be. Information is scattered, terms are confusing, and the fine print is hidden. Truva organizes all the facts into one clear, straightforward view, so you can compare options easily and choose what fits your life.
          </p>
        </div>
      </section>

      {/* Core Promises */}
      <section className="border-t border-brand-border bg-white py-24 dark:border-white/5 dark:bg-slate-900/20 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary dark:bg-brand-primary/20">
              The Pledge
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#07111f] dark:text-white sm:text-3xl md:text-4xl">
              Our Core Promises
            </h2>
            <p className="mt-4 text-base text-brand-textSecondary dark:text-gray-300 max-w-[60ch]">
              We built Truva around three simple promises to ensure our comparison platform is always on your side.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <article 
                  key={principle.title} 
                  className="group relative rounded-2xl border border-brand-border bg-brand-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white dark:bg-brand-primary/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-[#07111f] dark:text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setting the Record Straight */}
      <section className="border-t border-brand-border py-24 dark:border-white/5 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary dark:bg-brand-primary/20">
              Transparency
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#07111f] dark:text-white sm:text-3xl md:text-4xl">
              Setting the Record Straight
            </h2>
            <p className="mt-4 text-base text-brand-textSecondary dark:text-gray-300 max-w-[60ch]">
              Building trust starts with absolute transparency. Here is exactly what Truva is, and what we will never be.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* What We Are */}
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/[0.02] p-8 dark:border-brand-primary/30 dark:bg-brand-primary/[0.01]">
              <div className="flex items-center gap-3 text-brand-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#07111f] dark:text-white">What Truva Is</h3>
              </div>
              <ul className="mt-8 space-y-6 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold select-none">•</span>
                  <span><strong>An Independent Platform:</strong> We combine live rates from digital banks, traditional banks, government programs, and credit cards so you can see all your choices in one view.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold select-none">•</span>
                  <span><strong>Fact-Checked and Objective:</strong> We list every product we can find, whether they work with us or not. Our rankings are driven by rates and conditions, never by sponsors.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold select-none">•</span>
                  <span><strong>Everyday Language Translator:</strong> We translate complicated banking jargon into clear, everyday terms that anyone can understand.</span>
                </li>
              </ul>
            </div>

            {/* What We Are Not */}
            <div className="rounded-2xl border border-red-500/10 bg-red-50/[0.15] p-8 dark:border-red-500/20 dark:bg-red-500/[0.01]">
              <div className="flex items-center gap-3 text-[#F04438]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F04438]/10 dark:bg-[#F04438]/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#07111f] dark:text-white">What Truva Is NOT</h3>
              </div>
              <ul className="mt-8 space-y-6 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="text-[#F04438] font-bold select-none">•</span>
                  <span><strong>Not a Bank or Fund Custodian:</strong> We never hold, touch, or manage your money. You do not deposit money with us. You always apply directly with the licensed provider of your choice.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#F04438] font-bold select-none">•</span>
                  <span><strong>Not a Financial Advisor:</strong> We show you structured numbers and clear rules to help you compare, but we do not give personalized financial advice. You are always in control.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#F04438] font-bold select-none">•</span>
                  <span><strong>Not a Hidden Ad Wall:</strong> We do not sell secret placements to promote lower-quality products. If a partner sponsors a product, it will always be clearly labeled as a sponsored placement. Our core comparisons remain objective, transparent, and driven by numbers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="border-t border-brand-border bg-white py-24 dark:border-white/5 dark:bg-slate-900/20 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary dark:bg-brand-primary/20">
              Who We Help
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#07111f] dark:text-white sm:text-3xl md:text-4xl">
              Built for your real financial moments
            </h2>
            <p className="mt-4 text-base text-brand-textSecondary dark:text-gray-300 max-w-[60ch]">
              Whether you are growing your money, choosing your first card, or protecting your family, we build tools that make the next step simple and clear.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {targetUsers.map((user) => (
              <article 
                key={user.title} 
                className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-brand-border dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={user.image} 
                    alt={user.title} 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#07111f] dark:text-white">
                    {user.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {user.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="border-t border-brand-border py-24 dark:border-white/5 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Double-Bezel Card Layout */}
          <div className="rounded-[2rem] border border-slate-200/60 bg-slate-100/50 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="rounded-[1.8rem] bg-white p-8 dark:bg-slate-950 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <div className="grid gap-10 md:grid-cols-[160px_1fr] items-center">
                <div className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-brand-primary/10 mx-auto md:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/images/beto.jpg" 
                    alt="Beto" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary block">
                    Our Story
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-[#07111f] dark:text-white sm:text-2xl">
                    Built for clearer financial choices
                  </h2>
                  <div className="mt-6 space-y-5 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
                    <p className="italic font-medium text-brand-textPrimary dark:text-white">
                      &ldquo;I started Truva because comparing financial products in the Philippines is harder than it should be. Information is scattered, terms are confusing, and people often have to make important money decisions without a clear view of their options. Truva exists to make those choices clearer, so Filipinos can save time, avoid costly mistakes, and choose products that actually fit their lives.&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-semibold text-brand-textSecondary dark:text-gray-400">
                        Beto, Solo Founder and Developer at Truva
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">•</span>
                      <a 
                        href="https://www.linkedin.com/in/aldaba-alberto/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primaryDark transition-colors"
                        aria-label="Aldaba Alberto's LinkedIn Profile"
                      >
                        <svg 
                          className="h-3.5 w-3.5 fill-current" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meaning Behind the Name */}
          <div className="max-w-3xl mx-auto space-y-6 md:px-8">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary block text-center md:text-left">
              Behind the Name
            </span>
            <h2 className="text-xl font-bold text-[#07111f] dark:text-white sm:text-2xl text-center md:text-left">
              Why we are called Truva
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
              <p>
                People often ask how we chose our name. <strong>Truva</strong> was born from a simple promise: it stands for <strong>True Value</strong>.
              </p>
              <p>
                We believe every Filipino deserves to know exactly where their hard-earned money will go the furthest. Whether it is finding a savings account that pays honest interest, a credit card with real cashback, or insurance that actually protects your family, you deserve to get the true value out of every single peso.
              </p>
              <p>
                We are building <strong>Truva</strong> to be an independent, clear, and straightforward platform you can always rely on. We hope you stay for the ride as we grow, build better tools, and create a stronger financial future for every Filipino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization Transparency */}
      <section className="border-t border-brand-border bg-white py-24 dark:border-white/5 dark:bg-slate-900/20 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-brand-border bg-brand-surface p-8 dark:border-white/10 dark:bg-white/[0.02] sm:p-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-brand-primary">
                <HelpCircle className="h-6 w-6" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] block">
                  How We Stay Free
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-[#07111f] dark:text-white sm:text-2xl">
                Our Monetization Transparency
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
                Truva is free to use, and we will never charge you for comparing products or using our calculators. We do not sell your personal data, and we do not clutter the screen with annoying pop-up ads.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
                Instead, we earn a fee (a commission) from our financial partners when you apply for a credit card or open a savings account using our affiliate link. This fee is paid directly by the partner and does not increase your cost or change the interest rate you receive.
              </p>
              
              <div className="mt-8 border-t border-brand-border pt-8 dark:border-white/10">
                <p className="text-xs italic text-brand-textSecondary dark:text-gray-400">
                  <strong>Affiliate Disclosure:</strong> We earn a fee if you apply through our links. This does not change what you are offered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="border-t border-brand-border py-24 dark:border-white/5 sm:py-32 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary mx-auto dark:bg-brand-primary/20">
            <Heart className="h-6 w-6 text-brand-primary animate-pulse" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#07111f] dark:text-white sm:text-3xl md:text-4xl">
            Find the right product for your life
          </h2>
          <p className="mt-4 text-base text-brand-textSecondary dark:text-gray-300 sm:text-lg">
            Compare bank rates, credit cards, or insurance in one clear view. Choose the option that fits your life with absolute confidence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white transition-all hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 active:scale-[0.98]"
            >
              Go back to home
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
