import { CreditCardProduct } from '@/types';
import fs from 'fs';
import path from 'path';
import { normalizeCreditCardProduct } from './score';

export async function getCreditCards(): Promise<CreditCardProduct[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'credit-cards.json');
    if (!fs.existsSync(filePath)) return [];
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return (JSON.parse(fileContents) as CreditCardProduct[]).map(normalizeCreditCardProduct);
  } catch (e) {
    console.error("Failed to parse credit cards:", e);
    return [];
  }
}

export async function getCreditCardById(id: string): Promise<CreditCardProduct | null> {
  const cards = await getCreditCards();
  return cards.find(card => card.id === id) || null;
}
