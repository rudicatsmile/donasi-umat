// Standard Reference Values for Zakat (BAZNAS 2026)
export const ZAKAT_CONSTANTS = {
  GOLD_PRICE_PER_GRAM: 1400000, // Rp 1.400.000 per gram
  NISAB_GOLD_GRAMS: 85, // 85 grams
  NISAB_MAAL_YEARLY: 85 * 1400000, // Rp 119.000.000
  NISAB_PROFIT_MONTHLY: Math.round((85 * 1400000) / 12), // Rp 9.916.667 per bulan
  ZAKAT_RATE: 0.025, // 2.5%
};
