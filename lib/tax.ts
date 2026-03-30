// Standard bank interest (20% FWT)
export const calcAfterTaxPhp = (grossRate: number): number => grossRate * 0.80;

// Dollar time deposits (7.5% FCD rate)
export const calcAfterTaxDollarTD = (grossRate: number): number => grossRate * 0.925;

// Tax-exempt products (MP2, T-Bills, RTBs)
export const calcTaxExempt = (grossRate: number): number => grossRate;
