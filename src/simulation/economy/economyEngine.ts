import { EconomyState } from '../../types/market';
import { SeededRNG } from '../../utils/random';
import { clamp } from '../../utils/math';

// Seasonal index factors for Q1, Q2, Q3, Q4 with Q4 as peak
// TODO: Populate exact quarterly seasonal index coefficients from Topaz Table
export const SEASONAL_FACTORS: Record<1 | 2 | 3 | 4, number> = {
  1: 0.92,
  2: 1.02,
  3: 0.96,
  4: 1.30, // Q4 peak
};

export function advanceEconomy(current: EconomyState, rng: SeededRNG): EconomyState {
  const nextQuarter = (current.quarter === 4 ? 1 : current.quarter + 1) as 1 | 2 | 3 | 4;
  const nextYear = current.quarter === 4 ? current.year + 1 : current.year;

  let gdpGrowth = 0.01;
  let cbrAdjustment = 0;
  let unempAdjustment = 0;

  // Stochastic economic cycle influenced by mode
  const cycleVariation = rng.nextGaussian(0, 0.004);

  switch (current.mode) {
    case 'growth':
      gdpGrowth = 0.015 + cycleVariation;
      cbrAdjustment = (rng.next() - 0.45) * 0.0025;
      unempAdjustment = -0.001 + (rng.next() - 0.5) * 0.002;
      break;
    case 'decline':
      gdpGrowth = -0.008 + cycleVariation;
      cbrAdjustment = (rng.next() - 0.55) * 0.0025;
      unempAdjustment = 0.002 + (rng.next() - 0.5) * 0.002;
      break;
    case 'static':
    default:
      gdpGrowth = 0.003 + cycleVariation;
      cbrAdjustment = (rng.next() - 0.5) * 0.001;
      unempAdjustment = (rng.next() - 0.5) * 0.001;
      break;
  }

  const nextGdpIndex = Math.max(70, current.gdpIndex * (1 + gdpGrowth));
  const nextCbr = clamp(current.centralBankRate + cbrAdjustment, 0.02, 0.16);
  const nextUnemp = clamp(current.unemploymentRate + unempAdjustment, 0.03, 0.14);
  const nextInflation = clamp(current.inflationRate + (gdpGrowth > 0.01 ? 0.001 : -0.001), 0.01, 0.08);

  return {
    year: nextYear,
    quarter: nextQuarter,
    gdpIndex: nextGdpIndex,
    gdpGrowthRate: gdpGrowth,
    unemploymentRate: nextUnemp,
    centralBankRate: nextCbr,
    inflationRate: nextInflation,
    seasonalFactor: SEASONAL_FACTORS[nextQuarter],
    mode: current.mode,
  };
}
