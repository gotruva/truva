import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data protection disclosures for using Truva, in compliance with RA 10173.',
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen py-16 md:py-24 px-4 md:px-8">
      {/* Subtle background glow effects */}
      <div className="pointer-events-none fixed inset-0 flex justify-center -z-10">
        <div className="absolute top-0 w-full max-w-lg h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-brand-primary/5 dark:bg-brand-primary/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-brand-textPrimary dark:text-white">
          Privacy Policy & Disclosures
        </h1>
        <p className="text-brand-textSecondary dark:text-gray-400 mb-10">
          Last updated: June 2026 | Compliant with RA 10173 (Philippine Data Privacy Act)
        </p>

        <div className="space-y-12">
          {/* Section 1: Introduction & Posture */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">1. Our Commitment to Privacy</h2>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed mb-4">
              Truva (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a financial comparison platform for retail yield and credit card products in the Philippines. 
              We are dedicated to helping you make informed decisions about your money while maintaining a highly transparent and secure posture.
            </p>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
              <strong>Core Privacy Principle:</strong> Truva does <strong>not</strong> hold custody of your funds, manage financial accounts, or request highly sensitive personal details. We are a comparison service. 
              Any bank account or credit card application you choose to open is completed directly on the respective licensed bank&apos;s external website.
            </p>
          </section>

          {/* Section 2: GA4 Disclosures */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">2. Product Analytics & Cookies</h2>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed mb-6">
              We use Google Analytics 4 (GA4, Measurement ID <code>G-VKNLYP2027</code>) to study how visitors interact with our rate calculators, tools, and comparison guides. This data lets us make Truva more useful and identify where users encounter friction.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">What We Track (Coarse & Privacy-Safe Only)</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed mb-3">
                  All user analytics data is collected pseudonymously and grouped into coarse, aggregated buckets. We do <strong>not</strong> collect personally identifying information (PII) such as your name, phone number, email address, or home address through our product tracking layer.
                </p>
                <ul className="list-disc pl-5 text-sm text-brand-textSecondary dark:text-gray-400 space-y-2">
                  <li><strong>Credit Card Finder:</strong> When you use our quiz, we track answers as coarse tags (e.g. <code>priority: &quot;cashback&quot;</code> or <code>spend: &quot;low&quot;</code>). Income is sent strictly as a broad category band (e.g. <code>&quot;50-100&quot;</code>), never an exact number.</li>
                  <li><strong>Quiz Abandonment:</strong> If you navigate away or close the tab mid-quiz, we record which step you reached and your partial answers in coarse buckets to improve our interface.</li>
                  <li><strong>Browse & Catalog Actions:</strong> We record general filters applied, sort modes chosen, and which product rows are expanded.</li>
                  <li><strong>Search Usage:</strong> We only track the <em>length</em> of search queries (e.g., query was 5 characters long) and the number of results returned, never the raw typed text.</li>
                  <li><strong>Affiliate CTAs:</strong> We record when a button like &quot;Apply on bank site&quot; is clicked, which card was selected, and the placement on our page.</li>
                  <li><strong>Technical Identifiers:</strong> We utilize GA4&apos;s pseudonymous client ID (stored as a cookie on your browser) to distinguish returning visits.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">Google Consent Mode v2 Integration</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  We respect your choice. Analytics tracking is completely <strong>disabled by default</strong> on your first visit. You can accept or deny analytics cookies at any time via our Cookie Consent Banner. If you deny analytics, Google Consent Mode v2 ensures GA4 behaves in a cookieless manner, preventing the storage of user-level tracking identifiers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: RA 10173 Compliance */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">3. Your Rights Under the DPA (RA 10173)</h2>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed mb-4">
              Under Republic Act No. 10173, otherwise known as the Philippine Data Privacy Act of 2012 (DPA), you are entitled to specific rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 text-sm text-brand-textSecondary dark:text-gray-400 space-y-2 leading-relaxed">
              <li><strong>Right to be Informed:</strong> You have the right to know whether personal data is being processed, and to be notified of the details of such processing (which we fulfill via this policy).</li>
              <li><strong>Right to Access:</strong> Upon demand, you have the right to reasonable access to your personal data or tracking identifiers.</li>
              <li><strong>Right to Object:</strong> You can refuse analytics tracking at any time by selecting &quot;Decline All&quot; or updating your preferences in our Cookie Banner.</li>
              <li><strong>Right to Erasure or Blocking:</strong> You have the right to suspend, withdraw, or order the blocking, removal, or destruction of your personal data from our systems.</li>
              <li><strong>Right to Damages & Complaints:</strong> You have the right to be indemnified for any damages sustained due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of personal data, and to file a complaint before the National Privacy Commission (NPC).</li>
            </ul>
          </section>

          {/* Section 4: Personal Information Controller */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">4. Information Controller & Contact</h2>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed mb-4">
              Truva is the Personal Information Controller (PIC) for any pseudonymous information processed through our platform. 
              If you have any questions, requests to exercise your privacy rights, or concerns about our data protection posture, you can contact us directly:
            </p>
            <div className="bg-brand-surface dark:bg-slate-950 p-4 rounded-xl border border-brand-border/40 dark:border-white/5 text-sm space-y-2">
              <p className="text-brand-textPrimary dark:text-gray-200">
                <strong>Attention:</strong> Privacy Officer & Founder
              </p>
              <p className="text-brand-textSecondary dark:text-gray-400">
                <strong>Email Address:</strong> <a href="mailto:beto@gotruva.com" className="text-brand-primary hover:underline">beto@gotruva.com</a>
              </p>
            </div>
            <p className="text-xs text-brand-textSecondary dark:text-gray-500 mt-6 leading-relaxed">
              For official complaints or further information on the Data Privacy Act, you may contact the National Privacy Commission (NPC) at <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-textPrimary dark:hover:text-white">https://privacy.gov.ph</a>.
            </p>
          </section>

          {/* Return Links */}
          <div className="text-center pt-4">
            <Link href="/" className="text-brand-primary hover:underline text-sm font-semibold inline-flex items-center gap-1">
              &larr; Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
