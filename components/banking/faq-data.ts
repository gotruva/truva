export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How do I pick the right digital bank?',
    a: 'Start with how soon you might need the money and how much you want to save. If you might need it within a few weeks, pick a savings account with no lock-in. If you can leave it for a year or more, a time deposit usually pays more. The form above sorts the options for your amount and timeline.',
  },
  {
    q: 'Are digital banks in the Philippines safe?',
    a: 'Yes, when they are licensed by the Bangko Sentral ng Pilipinas and covered by PDIC. Every product on Truva shows whether it has PDIC protection. Digital banks use the same regulation as traditional banks and most use modern security like biometric login and real-time fraud checks.',
  },
  {
    q: 'What is PDIC insurance?',
    a: 'PDIC is a government agency that protects your bank deposits. If a covered bank closes, PDIC pays you back up to ₱1 million per depositor per bank. You do not need to sign up — coverage is automatic for every peso account the bank holds for you.',
  },
  {
    q: "What's the difference between a savings account and a time deposit?",
    a: 'A savings account lets you take your money out anytime. A time deposit locks your money for a set period — like 3, 6, or 12 months — in exchange for a higher rate. If you cancel a time deposit early, you usually lose part of the interest.',
  },
  {
    q: 'Why does a bank advertise a high rate like 15% when I might only see 3%?',
    a: "Many high rates come with conditions. For example, Maya's headline rate needs monthly \"missions\" — paying with their QR, paying bills, buying load. Without the conditions, you earn the base rate. The conditions for each product are shown right next to the rate above.",
  },
  {
    q: 'What happens if a promo rate expires?',
    a: "When a promo ends, your money drops to the bank's regular rate. Truva shows the end date for every promo so you know what to expect. We do not surface promos that have already expired.",
  },
  {
    q: 'Should I split my money across multiple banks?',
    a: 'Many Filipino savers do. Each bank has a separate ₱1 million PDIC limit, so splitting bigger balances keeps everything fully protected. Different banks also pay better for different amounts and timelines, so you can use one for emergency money and another for longer-term saving.',
  },
  {
    q: 'What if my bank closes — do I lose my money?',
    a: 'For PDIC-covered banks, no. PDIC validates and pays out insured deposits up to ₱1 million per depositor, usually within a few months. Anything above ₱1 million in a single bank is not guaranteed, which is one reason savers spread larger amounts across banks.',
  },
  {
    q: 'Does Truva hold or move my money?',
    a: "No. Truva is a comparison site, not a bank. Your money stays with the bank you choose. We never see your account, your balance, or your transactions. When you click Apply, you go straight to the bank's own site.",
  },
  {
    q: 'What about the tax on interest earnings?',
    a: "Philippine banks deduct a 20% withholding tax from interest before it reaches your account. The rate shown on Truva is the rate the bank advertises. Your actual peso interest will be a bit lower after the bank's deduction, which the bank handles for you automatically.",
  },
];
