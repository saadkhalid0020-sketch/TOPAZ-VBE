import { EconomyState } from '../../types/market';
import { clamp, safeDivide } from '../../utils/math';

export interface SharePriceEvaluationFactors {
  netWorth: number;
  lastQuarterNetProfit: number;
  annualizedNetProfit: number;
  cash: number;
  totalDebt: number; // Overdraft + Unsecured loans
  dividendsPaidThisYear: number;
  marketShare: number;
  capacityUtilization: number;
  customerSatisfactionScore: number; // Derived from image & low backlog
  economy: EconomyState;
  sharesOutstanding?: number;
}

/**
 * Dedicated share price calculation function.
 * Evaluates core fundamental metrics, profitability, financial health, and market standing.
 * All coefficients are configurable and transparently documented.
 */
export function calculateSharePrice(factors: SharePriceEvaluationFactors): number {
  const shares = factors.sharesOutstanding || 100000;
  
  // 1. Book value per share (Net worth / shares)
  const bookValuePerShare = Math.max(0.50, safeDivide(factors.netWorth, shares, 1.0));

  // 2. Earnings per share (EPS) contribution
  const annualizedEPS = safeDivide(factors.annualizedNetProfit, shares, 0);
  const peMultiple = 12.0 * (1 + (factors.economy.gdpGrowthRate * 10));
  const earningsValuation = Math.max(0, annualizedEPS * peMultiple);

  // 3. Balance sheet health & gearing penalty
  // Debt to equity ratio
  const debtToEquity = safeDivide(factors.totalDebt, Math.max(1, factors.netWorth), 0);
  const gearingPenalty = debtToEquity > 0.40 ? Math.max(0.60, 1.0 - (debtToEquity - 0.40) * 0.8) : 1.0;

  // 4. Liquidity & dividend yield bonus
  const dividendPerShare = safeDivide(factors.dividendsPaidThisYear, shares, 0);
  const dividendBonus = Math.min(0.20, dividendPerShare * 2.5);

  // 5. Operational excellence & market share multiplier
  const marketShareBonus = Math.min(0.25, factors.marketShare * 0.5);
  const utilizationBonus = (clamp(factors.capacityUtilization, 0.4, 1.0) - 0.7) * 0.15;
  const satisfactionBonus = ((factors.customerSatisfactionScore / 100) - 0.5) * 0.20;

  // 6. Economic climate factor
  const economicClimateFactor = (factors.economy.gdpIndex / 100) * (1 - factors.economy.centralBankRate * 1.5);

  // Fundamental valuation blend (60% earnings, 40% asset backing)
  const baseFundamentalPrice = (earningsValuation * 0.60 + bookValuePerShare * 0.40);

  const calculatedPrice =
    baseFundamentalPrice *
    gearingPenalty *
    (1 + dividendBonus + marketShareBonus + utilizationBonus + satisfactionBonus) *
    clamp(economicClimateFactor, 0.75, 1.25);

  // Simulation invariant: Share price >= 0
  return Math.max(0.10, Math.round(calculatedPrice * 100) / 100);
}
