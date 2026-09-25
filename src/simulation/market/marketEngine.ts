import { ProductId } from '../../types/product';
import { MarketId, MarketState, EconomyState } from '../../types/market';
import { CompanyState } from '../../types/company';
import { table01Demographics } from '../../data/tables/demographics';
import { table02InformationSellingCosts } from '../../data/tables/informationSellingCosts';
import { table23CreditTerms } from '../../data/tables/creditTerms';
import { SeededRNG } from '../../utils/random';
import { clamp, safeDivide } from '../../utils/math';

export interface MarketSimulationResult {
  ordersReceived: Record<ProductId, Record<MarketId, number>>;
  actualSales: Record<ProductId, Record<MarketId, number>>;
  unfulfilledBacklog: Record<ProductId, Record<MarketId, number>>;
  cancelledOrders: Record<ProductId, Record<MarketId, number>>;
  orderValueTotal: number;
  salesValueTotal: number;
  salesCommissionsTotal: number;
  sellingOfficeOverheadTotal: number;
  marketShareQuarter: Record<ProductId, Record<MarketId, number>>;
  companyOverallMarketShare: number;
}

export function simulateMarketDemand(
  company: CompanyState,
  competitors: CompanyState[],
  economy: EconomyState,
  rng: SeededRNG
): MarketSimulationResult {
  const allCompanies = [company, ...competitors];
  const products: ProductId[] = ['product1', 'product2', 'product3'];
  const markets: MarketId[] = ['south', 'west', 'north', 'export'];

  const ordersReceived: Record<ProductId, Record<MarketId, number>> = {
    product1: { south: 0, west: 0, north: 0, export: 0 },
    product2: { south: 0, west: 0, north: 0, export: 0 },
    product3: { south: 0, west: 0, north: 0, export: 0 },
  };

  const actualSales: Record<ProductId, Record<MarketId, number>> = {
    product1: { south: 0, west: 0, north: 0, export: 0 },
    product2: { south: 0, west: 0, north: 0, export: 0 },
    product3: { south: 0, west: 0, north: 0, export: 0 },
  };

  const unfulfilledBacklog: Record<ProductId, Record<MarketId, number>> = {
    product1: { south: 0, west: 0, north: 0, export: 0 },
    product2: { south: 0, west: 0, north: 0, export: 0 },
    product3: { south: 0, west: 0, north: 0, export: 0 },
  };

  const cancelledOrders: Record<ProductId, Record<MarketId, number>> = {
    product1: { south: 0, west: 0, north: 0, export: 0 },
    product2: { south: 0, west: 0, north: 0, export: 0 },
    product3: { south: 0, west: 0, north: 0, export: 0 },
  };

  const marketShareQuarter: Record<ProductId, Record<MarketId, number>> = {
    product1: { south: 0, west: 0, north: 0, export: 0 },
    product2: { south: 0, west: 0, north: 0, export: 0 },
    product3: { south: 0, west: 0, north: 0, export: 0 },
  };

  let totalCompanyOrdersValue = 0;
  let totalCompanyDeliveredSalesValue = 0;
  let totalIndustrySalesUnits = 0;
  let totalCompanySalesUnits = 0;

  // Base market potential per product
  const basePotential: Record<ProductId, number> = {
    product1: 2200,
    product2: 1400,
    product3: 800,
  };

  // Base benchmark prices
  const benchmarkPrices: Record<ProductId, number> = {
    product1: 55,
    product2: 85,
    product3: 135,
  };

  for (const mkt of markets) {
    const marketWeight =
      mkt === 'south'
        ? table01Demographics.southMarketWeight.value
        : mkt === 'west'
        ? table01Demographics.westMarketWeight.value
        : mkt === 'north'
        ? table01Demographics.northMarketWeight.value
        : table01Demographics.exportMarketWeight.value;

    for (const prodId of products) {
      // Total category demand influenced by GDP index, seasonality, and industry advertising
      let totalIndustryAdForProdMkt = 0;
      for (const comp of allCompanies) {
        const ad = comp.marketing.advertising[prodId]?.[mkt];
        if (ad) {
          totalIndustryAdForProdMkt += ad.tradePress + ad.advertisingSupport + ad.pointOfSale;
        }
      }

      const adExpansionMultiplier = 1.0 + Math.min(0.35, Math.sqrt(totalIndustryAdForProdMkt) * 0.003);
      const totalMarketSegmentPotential =
        basePotential[prodId] *
        marketWeight *
        (economy.gdpIndex / 100) *
        economy.seasonalFactor *
        adExpansionMultiplier;

      // Calculate company attractiveness scores
      const attractivenessScores: Array<{ compId: string; score: number }> = [];

      for (const comp of allCompanies) {
        const prod = comp.products.find(p => p.id === prodId);
        const price = mkt === 'export' ? prod?.exportPrice ?? 0 : prod?.homePrice ?? 0;

        // If price is 0, product is not offered
        if (!prod || price <= 0) {
          attractivenessScores.push({ compId: comp.id, score: 0 });
          continue;
        }

        // Price sensitivity: standard downward sloping demand curve
        const benchmark = benchmarkPrices[prodId];
        const priceRatio = price / benchmark;
        const priceScore = Math.max(0.05, Math.pow(benchmark / price, 1.6));

        // Credit terms effect: 30 days normal. Interacts with Central Bank Rate
        const creditDays = comp.marketing.creditTermsDays || 30;
        const creditDifference = creditDays - table23CreditTerms.normalCreditDays.value;
        const cbrFactor = 1.0 + economy.centralBankRate * 2.0;
        const creditScore = 1.0 + (creditDifference / 10) * table23CreditTerms.attractionSensitivityPer10Days.value * cbrFactor;

        // Product image & quality score
        const image = comp.marketing.productImage[prodId] || 50;
        const quality = prod.quality || 50;
        const design = prod.designRating || 50;
        const productExcellenceScore = Math.pow((image * 0.4 + quality * 0.35 + design * 0.25) / 50, 1.25);

        // Salespeople allocation in this market
        const marketState = comp.markets.find(m => m.id === mkt);
        const salespeople = marketState?.salespeopleAssigned || 0;
        const salesForceScore = 1.0 + Math.min(1.2, Math.sqrt(salespeople) * 0.35);

        // Backlog penalty: if company had heavy past backlog, retailer confidence drops slightly
        const currentBacklog = marketState?.backlog[prodId] || 0;
        const reliabilityPenalty = currentBacklog > 150 ? 0.88 : 1.0;

        const totalScore = Math.max(0.001, priceScore * creditScore * productExcellenceScore * salesForceScore * reliabilityPenalty);
        attractivenessScores.push({ compId: comp.id, score: totalScore });
      }

      const totalScoreSum = attractivenessScores.reduce((acc, c) => acc + c.score, 0);

      // Determine player company's share of orders in this market & product
      const playerAttractiveness = attractivenessScores.find(a => a.compId === company.id)?.score || 0;
      const playerShare = safeDivide(playerAttractiveness, totalScoreSum, 0);
      marketShareQuarter[prodId][mkt] = playerShare;

      // Base orders generated + random variation
      const randomNoise = rng.nextGaussian(1.0, 0.03);
      const newOrders = Math.round(totalMarketSegmentPotential * playerShare * randomNoise);

      ordersReceived[prodId][mkt] = Math.max(0, newOrders);

      // Retrieve existing backlog from previous quarter
      const marketState = company.markets.find(m => m.id === mkt);
      const priorBacklog = marketState?.backlog[prodId] || 0;

      // Total orders to satisfy = new orders + carried forward backlog
      const totalDemand = newOrders + priorBacklog;

      // Available stock in the regional warehouse
      const warehouse = company.warehouses.find(w => w.marketId === mkt);
      const availableStock = Math.max(0, warehouse?.stock[prodId] || 0);

      // Fulfillment
      const fulfilledUnits = Math.min(totalDemand, availableStock);
      actualSales[prodId][mkt] = fulfilledUnits;

      // Remaining unfulfilled orders
      const remainingUnfulfilled = Math.max(0, totalDemand - fulfilledUnits);

      // Rule: At quarter end, at least half (50%) of outstanding orders are cancelled.
      // Remaining carry forward.
      const cancellationRate = 0.50 + (rng.next() * 0.10); // 50% to 60%
      const cancelled = Math.round(remainingUnfulfilled * cancellationRate);
      const carriedBacklog = remainingUnfulfilled - cancelled;

      cancelledOrders[prodId][mkt] = cancelled;
      unfulfilledBacklog[prodId][mkt] = carriedBacklog;

      // Financial order and delivered sales value
      const price = mkt === 'export' ? company.products.find(p => p.id === prodId)?.exportPrice ?? 0 : company.products.find(p => p.id === prodId)?.homePrice ?? 0;
      totalCompanyOrdersValue += newOrders * price;
      totalCompanyDeliveredSalesValue += fulfilledUnits * price;

      totalCompanySalesUnits += fulfilledUnits;
      totalIndustrySalesUnits += Math.round(totalMarketSegmentPotential);
    }
  }

  // Commission is based on order value, not actual delivered sales!
  const commissionRate = company.employees.salespersonCommissionRate;
  const salesCommissionsTotal = totalCompanyOrdersValue * commissionRate;

  // Selling-office overhead is 1% of order value according to Topaz rules
  const sellingOfficeOverheadRate = table02InformationSellingCosts.sellingOfficeOverheadRate.value;
  const sellingOfficeOverheadTotal = totalCompanyOrdersValue * sellingOfficeOverheadRate;

  const companyOverallMarketShare = safeDivide(totalCompanySalesUnits, totalIndustrySalesUnits, 0.25);

  return {
    ordersReceived,
    actualSales,
    unfulfilledBacklog,
    cancelledOrders,
    orderValueTotal: totalCompanyOrdersValue,
    salesValueTotal: totalCompanyDeliveredSalesValue,
    salesCommissionsTotal,
    sellingOfficeOverheadTotal,
    marketShareQuarter,
    companyOverallMarketShare,
  };
}
