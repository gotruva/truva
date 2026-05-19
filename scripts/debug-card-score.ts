/**
 * Debug: inspect card fields that affect scoring.
 */
import 'dotenv/config';
import { getCreditCards } from '../lib/credit-cards';
import { scoreFinderCard, deriveTags, incomeBracketMin } from '../lib/creditCardFinder/rank';

const ANSWER = {
  first: 'yes' as const, income: '50-100' as const, spend: 'groceries' as const,
  priority: 'naf' as const, avoid: null,
};

async function main() {
  const cards = await getCreditCards();
  console.log(`Total cards: ${cards.length}\n`);

  // Check for scoring suppression
  const suppressed = cards.filter(c => 
    c.methodology_ready === false || c.score_ready === false || c.score_suppressed_reason
  );
  console.log(`Suppressed cards: ${suppressed.length}`);
  for (const s of suppressed) {
    console.log(`  ${s.bank} — ${s.card_name} | methodology_ready=${s.methodology_ready} score_ready=${s.score_ready} suppressed=${s.score_suppressed_reason}`);
  }

  // Check cards with income_filter_ready
  const noIncomeFilter = cards.filter(c => c.income_filter_ready !== true);
  console.log(`\nCards without income_filter_ready: ${noIncomeFilter.length}`);

  // Score a single card step by step
  const testCard = cards[0];
  console.log(`\n--- Debug: ${testCard.bank} — ${testCard.card_name} ---`);
  console.log(JSON.stringify({
    methodology_ready: testCard.methodology_ready,
    score_ready: testCard.score_ready,
    score_suppressed_reason: testCard.score_suppressed_reason,
    income_filter_ready: testCard.income_filter_ready,
    min_income_monthly: testCard.min_income_monthly,
    rewards_type: testCard.rewards_type,
    naffl: testCard.naffl,
    annual_fee_recurring: testCard.annual_fee_recurring,
    card_tier: testCard.card_tier,
    last_scraped_at: testCard.last_scraped_at,
    source_url: testCard.source_url,
    badge_inputs: testCard.badge_inputs,
  }, null, 2));
  
  const tags = deriveTags(testCard);
  console.log('Tags:', tags);
  const score = scoreFinderCard(testCard, ANSWER);
  console.log('Score:', score);
}

main().catch(e => { console.error(e); process.exit(1); });
