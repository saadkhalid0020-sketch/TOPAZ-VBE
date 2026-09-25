import { ProductId, ProductState, DevelopmentOutcome } from '../../types/product';
import { MarketingDecisions } from '../../types/decisions';
import { SeededRNG } from '../../utils/random';
import { clamp } from '../../utils/math';

export interface MarketingUpdateResult {
  updatedProducts: ProductState[];
  productImages: Record<ProductId, number>;
  outcomes: Record<ProductId, DevelopmentOutcome>;
  advertisingTotals: Record<ProductId, number>;
  totalAdvertisingSpend: number;
  totalDevSpend: number;
}

export function processMarketingAndRAndD(
  currentProducts: ProductState[],
  decisions: MarketingDecisions,
  rng: SeededRNG
): MarketingUpdateResult {
  const updatedProducts: ProductState[] = [];
  const productImages: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
  const outcomes: Record<ProductId, DevelopmentOutcome> = { product1: 'NONE', product2: 'NONE', product3: 'NONE' };
  const advertisingTotals: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };

  let totalAdvertisingSpend = 0;
  let totalDevSpend = 0;

  for (const product of currentProducts) {
    const prodId = product.id;
    const devBudget = Math.max(0, decisions.developmentBudgets[prodId] || 0);
    totalDevSpend += devBudget;

    // Calculate total advertising spent on this product across all markets and media
    let productAdSpend = 0;
    const prodAdDecisions = decisions.advertising[prodId];
    if (prodAdDecisions) {
      for (const mkt of ['south', 'west', 'north', 'export'] as const) {
        const media = prodAdDecisions[mkt];
        if (media) {
          productAdSpend += Math.max(0, media.tradePress || 0);
          productAdSpend += Math.max(0, media.advertisingSupport || 0);
          productAdSpend += Math.max(0, media.pointOfSale || 0);
        }
      }
    }
    advertisingTotals[prodId] = productAdSpend;
    totalAdvertisingSpend += productAdSpend;

    // Development progression
    const newCumulativeInvestment = product.developmentInvestment + devBudget;
    
    // Threshold progression for breakthroughs: higher cumulative spend increases chance
    const progressInc = (devBudget / 10000) * 0.15 + rng.nextFloat(0.01, 0.05);
    const newProgress = product.developmentProgress + progressInc;

    let outcome: DevelopmentOutcome = 'NONE';
    let pendingMajor = product.pendingMajorImprovementAvailable;
    let isObsolete = product.isModelObsolete;
    let quality = product.quality;
    let designRating = product.designRating;

    // Check if player decided to adopt previously unlocked major improvement
    if (decisions.adoptMajorImprovement[prodId] && pendingMajor) {
      pendingMajor = false;
      isObsolete = true; // Old inventory becomes obsolete/discounted
      quality = clamp(quality + 8, 0, 100);
      designRating = clamp(designRating + 12, 0, 100);
    }

    // Deterministic probabilistic breakthrough check based on cumulative progress
    if (devBudget > 0) {
      const roll = rng.next();
      if (newProgress >= 1.0 && roll < 0.25) {
        outcome = 'MAJOR';
        pendingMajor = true;
      } else if (roll < 0.35 + Math.min(0.20, devBudget / 20000)) {
        outcome = 'MINOR';
        // Minor improvements automatically incorporated
        quality = clamp(quality + 2, 0, 100);
        designRating = clamp(designRating + 2, 0, 100);
      }
    }
    outcomes[prodId] = outcome;

    // Cumulative product image calculation
    // Image is influenced by advertising, quality, design rating, and past performance
    const adImageContribution = Math.min(35, Math.sqrt(productAdSpend) * 0.45);
    const qualityImageContribution = quality * 0.35;
    const designImageContribution = designRating * 0.30;
    
    // Blended image with carryover (exponential smoothing)
    const baseImage = adImageContribution + qualityImageContribution + designImageContribution;
    const pastImage = product.quality; // baseline
    const calculatedImage = clamp(pastImage * 0.4 + baseImage * 0.6, 10, 100);

    productImages[prodId] = Math.round(calculatedImage);

    // Update prices from decisions
    const homePrice = decisions.prices[prodId]?.homePrice ?? product.homePrice;
    const exportPrice = decisions.prices[prodId]?.exportPrice ?? product.exportPrice;

    updatedProducts.push({
      ...product,
      quality,
      designRating,
      developmentInvestment: newCumulativeInvestment,
      developmentProgress: newProgress >= 1.0 && outcome === 'MAJOR' ? 0.1 : newProgress,
      developmentOutcome: outcome,
      pendingMajorImprovementAvailable: pendingMajor,
      isModelObsolete: isObsolete,
      homePrice,
      exportPrice,
    });
  }

  return {
    updatedProducts,
    productImages,
    outcomes,
    advertisingTotals,
    totalAdvertisingSpend,
    totalDevSpend,
  };
}
