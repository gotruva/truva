import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Legal disclaimers, terms of service, and conditions for using Truva.',
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen py-16 md:py-24 px-4 md:px-8">
      {/* Background purely for aesthetic using the glowing gradients mentioned */}
      <div className="pointer-events-none fixed inset-0 flex justify-center -z-10">
        <div className="absolute top-0 w-full max-w-lg h-[400px] bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-green-500/10 dark:bg-green-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-brand-textPrimary dark:text-white">
          Legal Disclaimers & Terms
        </h1>
        <p className="text-brand-textSecondary dark:text-gray-400 mb-10">
          Last updated: April 2026
        </p>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">1. Global Disclaimers</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">Not Financial Advice</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  The content provided on Truva is for educational, informational, and comparative purposes only. Truva does not provide professional financial, investment, legal, or tax advice. Always consult with a licensed professional before making any financial decisions or investments.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">Affiliate & Compensation Disclosure</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  Truva.ph is an independent, advertising-supported comparison service. We may receive compensation from our partner institutions when you click on links, open accounts, or purchase products through our platform. This compensation may impact how and where products appear on this site, but it does not influence our objective rate calculations or our editorial content.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">Accuracy of Data & Rates</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  While we strive to keep our rate comparisons and product details accurate and up to date, interest rates, financial product terms, and tax policies are subject to change without notice by the respective institutions. Truva does not guarantee the accuracy of rates displayed. Always verify the most current rates and terms directly with the financial institution before committing to any product.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2">Tax Calculation Disclaimer</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  The &quot;after-tax&quot; yield calculator and figures provided on Truva are purely estimates based on standard Philippine taxation assumptions (such as the standard 20% Final Withholding Tax on bank deposits or standard tax-exempt statuses). Your actual tax liability may vary depending on your personal financial circumstances and changes in national tax laws.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-brand-border/60 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 font-sans text-brand-textPrimary dark:text-gray-100">2. Terms & Conditions</h2>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm mb-6">
              By accessing and using Truva.ph (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, please do not use our platform.
            </p>

            <div className="space-y-6 text-sm text-brand-textSecondary dark:text-gray-400 leading-relaxed">
              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2 text-base">A. Role of Truva</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Information Aggregator:</strong> Truva acts strictly as a data aggregator, providing a directory and comparison tool for retail financial products (such as deposits, government bonds, UITFs, and decentralized finance protocols).</li>
                  <li><strong>Not a Financial Institution:</strong> Truva is <strong>not</strong> a bank, a deposit-taking institution, an investment broker, or a financial advisor. We do not sell securities and are not licensed by the Bangko Sentral ng Pilipinas (BSP) or the Securities and Exchange Commission (SEC) to perform such operations.</li>
                  <li><strong>No Custody of Funds:</strong> Truva will never request deposits, handle financial transactions, or hold custody of your money. Any accounts opened or financial agreements entered into are strictly between you and the respective third-party financial institution.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2 text-base mt-6">B. Third-Party Links & Liability</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>External Platforms:</strong> Our site contains links to third-party digital banks, government platforms, and decentralized finance (DeFi) protocols (e.g., Aave). We do not control these external websites, and you access them at your own risk.</li>
                  <li><strong>DeFi Risks:</strong> Decentralized Finance (DeFi) products involve entirely different risk profiles than traditional banking, including smart contract vulnerabilities, stablecoin depegging risks, and a lack of regulatory safety nets. Truva is not liable for any losses incurred due to protocol exploits or market fluctuations.</li>
                  <li><strong>Limitation of Liability:</strong> To the maximum extent permitted by Philippine law, Truva, its founders, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the information provided on our site, platform outages, or the default, insolvency, or actions of any third-party institution listed on our site.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2 text-base mt-6">C. Deposit Insurance Acknowledgment</h3>
                <p>
                  You acknowledge that financial products have different insurance statuses. Standard deposit accounts offered by licensed banks in the Philippines may be insured by the Philippine Deposit Insurance Corporation (PDIC) up to a maximum amount of <strong>₱1,000,000 per depositor per bank</strong>. However, certain products listed on Truva—such as Government Bonds, UITFs, and DeFi products—are <strong>NOT PDIC-insured</strong>, are not guaranteed by the platform, and are subject to capital loss.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-brand-textPrimary dark:text-gray-200 mb-2 text-base mt-6">D. Intellectual Property</h3>
                <p>
                  All content, design features, calculator algorithms, trademarks, and logos on Truva.ph are the intellectual property of Truva or its respective licensors. You may not scrape, copy, modify, distribute, or commercially exploit our platform&apos;s data or structure without our express written permission.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
