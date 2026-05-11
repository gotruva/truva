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
    a: "Many high rates come with conditions. For example, Maya's headline rate only applies to your first ₱100,000 — above that, the rate drops to the base rate. Some banks also need monthly missions like paying with their QR or adding new money. The conditions for each product are shown right next to the rate above, and inside the details drawer.",
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
    q: 'How is my actual peso interest calculated after tax?',
    a: 'For most peso savings accounts, the bank deducts 20% withholding tax from interest before it reaches you. The peso interest shown on Truva is the gross amount, exactly as the bank advertises it. To estimate what reaches your account, multiply the gross interest by 0.80. Example: a 4% account with ₱50,000 saved for one year earns about ₱2,000 in gross interest — about ₱1,600 reaches you after the bank deducts the 20% tax.',
  },
  {
    q: 'Are any savings products tax-free?',
    a: 'Yes. Pag-IBIG MP2 dividends are tax-exempt when you hold the contribution for the full 5-year term. Some long-tenor government securities are also tax-advantaged for certain holders. Where a product is tax-exempt, the details drawer says so.',
  },
  {
    q: 'Does Truva subtract tax for me in the comparison?',
    a: 'No. Truva shows the gross rate that banks advertise, so the numbers match each bank\'s own marketing and are easy to verify on their website. Your bank handles the 20% withholding automatically before the interest reaches your account — for regular savings, you do not have to file anything yourself.',
  },
  {
    q: 'Do I need to maintain a balance?',
    a: 'Most digital banks have no maintaining balance. You can open an account with ₱0 and keep ₱0 in it without a monthly fee. Traditional banks like BPI or BDO usually require a maintaining balance of around ₱2,000 to ₱10,000 — going below means a monthly charge. The minimum to open each product is shown inside the details drawer for that row.',
  },
  {
    q: 'How fast can I move money in and out?',
    a: 'Transfers between Philippine banks happen through InstaPay (real-time, up to ₱50,000 per transaction) or PESONet (same-day batches). Most digital banks support both for free or for a small fee. Time deposits release your money at the end of the lock period — usually back into your linked savings account.',
  },
];
