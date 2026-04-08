import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beto - Founder of Truva',
  description: 'Meet the solo builder behind Truva, the Philippines\' dedicated after-tax personal finance platform.',
};

export default function AuthorPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center">
      <div className="mb-8 w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-4xl font-bold text-brand-primary mx-auto ring-4 ring-brand-primary/20">
        B
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Beto</h1>
      <p className="text-xl text-brand-textSecondary mb-12">
        Solo Founder & Lead Builder at Truva
      </p>
      
      <div className="prose prose-lg dark:prose-invert max-w-none text-left bg-brand-surface dark:bg-white/5 p-8 rounded-2xl border border-brand-border dark:border-white/10 shadow-sm">
        <p>
          <strong>Mabuhay!</strong> I built Truva because I realized how hard it was for regular Filipinos to figure out exactly how much their savings were actually earning.
        </p>
        <p>
          Between hidden promo conditions, lock-in periods, and the standard 20% Final Withholding Tax (FWT), comparing a digital bank against a tax-exempt government bond like MP2 felt like a math exam.
        </p>
        <p>
          I am a solo builder driven by a single goal: creating the most transparent, fast, and mathematically honest financial comparison platform in the Philippines. I write the code, verify the rates, and design the calculators you use here. 
        </p>
        <p>
          By keeping my team small and overhead low, Truva doesn't need to push bad products just to hit corporate revenue targets. The math wins, and you win.
        </p>
        <p className="mt-8 font-medium">
          If you have feedback, questions, or just want to say hi, feel free to reach out to me directly at <a href="mailto:partners@truva.ph" className="text-brand-primary hover:underline">partners@truva.ph</a>.
        </p>
      </div>
    </div>
  );
}
