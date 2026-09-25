import { CompanyState } from '../../types/company';
import { QuarterlyDecisions } from '../../types/decisions';
import { EconomyState } from '../../types/market';
import { SeededRNG } from '../../utils/random';
import { clamp } from '../../utils/math';

export function generateCompetitorDecisions(
  competitor: CompanyState,
  economy: EconomyState,
  rng: SeededRNG
): QuarterlyDecisions {
  const strategy = competitor.strategy || 'balanced';
  const cbr = economy.centralBankRate;
  const isBoom = economy.gdpGrowthRate > 0.015;
  const isRecession = economy.gdpGrowthRate < 0;

  // Base pricing tailored to strategy
  let p1Home = 55;
  let p2Home = 85;
  let p3Home = 135;
  let p1Exp = 52;
  let p2Exp = 80;
  let p3Exp = 128;

  let adMultiplier = 1.0;
  let rAndDMultiplier = 1.0;
  let assemblyHourlyWageOffer = competitor.employees.assemblyHourlyWage;
  let shifts = competitor.operations.shifts;
  let contractedMaintenance = 20;
  let creditDays = 30;

  switch (strategy) {
    case 'low-price':
      p1Home = 48;
      p2Home = 75;
      p3Home = 120;
      p1Exp = 46;
      p2Exp = 72;
      p3Exp = 115;
      adMultiplier = 0.8;
      rAndDMultiplier = 0.6;
      creditDays = 25;
      contractedMaintenance = 15;
      break;

    case 'premium-quality':
      p1Home = 62;
      p2Home = 96;
      p3Home = 152;
      p1Exp = 59;
      p2Exp = 92;
      p3Exp = 145;
      adMultiplier = 1.25;
      rAndDMultiplier = 1.6;
      assemblyHourlyWageOffer += 0.25;
      contractedMaintenance = 25;
      creditDays = 40;
      break;

    case 'marketing-heavy':
      p1Home = 58;
      p2Home = 88;
      p3Home = 140;
      p1Exp = 55;
      p2Exp = 84;
      p3Exp = 132;
      adMultiplier = 1.7;
      rAndDMultiplier = 1.1;
      creditDays = 35;
      break;

    case 'growth':
      p1Home = 52;
      p2Home = 80;
      p3Home = 128;
      p1Exp = 50;
      p2Exp = 77;
      p3Exp = 122;
      adMultiplier = 1.4;
      rAndDMultiplier = 1.2;
      shifts = competitor.machines.length > 2 ? 2 : 1;
      break;

    case 'balanced':
    default:
      p1Home = 55;
      p2Home = 85;
      p3Home = 135;
      p1Exp = 52;
      p2Exp = 80;
      p3Exp = 128;
      adMultiplier = 1.0;
      rAndDMultiplier = 1.0;
      break;
  }

  // Adjust for inflation and economy
  const inflationAdjustment = 1.0 + (economy.inflationRate * 0.5);
  p1Home = Math.round(p1Home * inflationAdjustment);
  p2Home = Math.round(p2Home * inflationAdjustment);
  p3Home = Math.round(p3Home * inflationAdjustment);

  // Advertising per product & market
  const buildAdMatrix = (baseMedia: { tradePress: number; adSupport: number; pos: number }) => ({
    south: {
      tradePress: Math.round(baseMedia.tradePress * adMultiplier * (isBoom ? 1.1 : 1.0)),
      advertisingSupport: Math.round(baseMedia.adSupport * adMultiplier * (isBoom ? 1.1 : 1.0)),
      pointOfSale: Math.round(baseMedia.pos * adMultiplier * (isBoom ? 1.1 : 1.0)),
    },
    west: {
      tradePress: Math.round(baseMedia.tradePress * 0.7 * adMultiplier),
      advertisingSupport: Math.round(baseMedia.adSupport * 0.7 * adMultiplier),
      pointOfSale: Math.round(baseMedia.pos * 0.7 * adMultiplier),
    },
    north: {
      tradePress: Math.round(baseMedia.tradePress * 0.9 * adMultiplier),
      advertisingSupport: Math.round(baseMedia.adSupport * 0.9 * adMultiplier),
      pointOfSale: Math.round(baseMedia.pos * 0.9 * adMultiplier),
    },
    export: {
      tradePress: Math.round(baseMedia.tradePress * 1.1 * adMultiplier),
      advertisingSupport: Math.round(baseMedia.adSupport * 1.0 * adMultiplier),
      pointOfSale: Math.round(baseMedia.pos * 0.6 * adMultiplier),
    },
  });

  const seasonalDemandScaling = economy.seasonalFactor;
  const p1Scheduled = Math.round(1400 * seasonalDemandScaling * (strategy === 'low-price' ? 1.25 : 1.0));
  const p2Scheduled = Math.round(900 * seasonalDemandScaling * (strategy === 'premium-quality' ? 1.15 : 1.0));
  const p3Scheduled = Math.round(480 * seasonalDemandScaling * (strategy === 'premium-quality' ? 1.25 : 1.0));

  return {
    marketing: {
      prices: {
        product1: { homePrice: p1Home, exportPrice: p1Exp },
        product2: { homePrice: p2Home, exportPrice: p2Exp },
        product3: { homePrice: p3Home, exportPrice: p3Exp },
      },
      advertising: {
        product1: buildAdMatrix({ tradePress: 1100, adSupport: 1300, pos: 900 }),
        product2: buildAdMatrix({ tradePress: 900, adSupport: 1100, pos: 700 }),
        product3: buildAdMatrix({ tradePress: 700, adSupport: 900, pos: 500 }),
      },
      developmentBudgets: {
        product1: Math.round(3000 * rAndDMultiplier),
        product2: Math.round(3000 * rAndDMultiplier),
        product3: Math.round(4000 * rAndDMultiplier),
      },
      adoptMajorImprovement: {
        product1: competitor.products.find(p => p.id === 'product1')?.pendingMajorImprovementAvailable ?? false,
        product2: competitor.products.find(p => p.id === 'product2')?.pendingMajorImprovementAvailable ?? false,
        product3: competitor.products.find(p => p.id === 'product3')?.pendingMajorImprovementAvailable ?? false,
      },
      creditTermsDays: creditDays,
    },
    operations: {
      deliveryQuantities: {
        product1: {
          south: Math.round(p1Scheduled * 0.30),
          west: Math.round(p1Scheduled * 0.22),
          north: Math.round(p1Scheduled * 0.26),
          export: Math.round(p1Scheduled * 0.22),
        },
        product2: {
          south: Math.round(p2Scheduled * 0.30),
          west: Math.round(p2Scheduled * 0.22),
          north: Math.round(p2Scheduled * 0.26),
          export: Math.round(p2Scheduled * 0.22),
        },
        product3: {
          south: Math.round(p3Scheduled * 0.30),
          west: Math.round(p3Scheduled * 0.22),
          north: Math.round(p3Scheduled * 0.26),
          export: Math.round(p3Scheduled * 0.22),
        },
      },
      assemblyTimeMinutes: {
        product1: strategy === 'premium-quality' ? 50 : 45,
        product2: strategy === 'premium-quality' ? 68 : 60,
        product3: strategy === 'premium-quality' ? 100 : 90,
      },
      shifts,
      contractedMaintenanceHoursPerMachine: contractedMaintenance,
      materialOrder: {
        supplierId: strategy === 'low-price' ? 3 : 1,
        units: Math.round((p1Scheduled + p2Scheduled * 1.5 + p3Scheduled * 2.0) * 1.05),
      },
      machinesToOrder: competitor.cash > 150000 && competitor.machines.length < 5 ? 1 : 0,
      machinesToSell: 0,
      vehiclesToBuy: 0,
      vehiclesToSell: 0,
    },
    personnel: {
      salespeopleHires: competitor.employees.salespeople < 8 ? 1 : 0,
      salespeopleDismissals: 0,
      salespeopleToTrain: 0,
      salespeopleAllocation: {
        south: Math.round(competitor.employees.salespeople * 0.35),
        west: Math.round(competitor.employees.salespeople * 0.25),
        north: Math.round(competitor.employees.salespeople * 0.25),
        export: Math.max(1, competitor.employees.salespeople - (Math.round(competitor.employees.salespeople * 0.35) + Math.round(competitor.employees.salespeople * 0.25) * 2)),
      },
      assemblyHires: competitor.employees.assemblyWorkers < 20 ? 2 : 0,
      assemblyDismissals: 0,
      assemblyToTrain: 0,
      assemblyHourlyWageOffer,
      marketingManagementBudget: 7500,
      productionManagementBudget: 7500,
      personnelManagementBudget: 5500,
      financialManagementBudget: 5500,
    },
    finance: {
      dividendPerShare: (economy.quarter === 1 || economy.quarter === 3) && competitor.finance.retainedEarnings > 100000 ? 0.05 : 0,
      debtRepaymentAmount: 0,
    },
    research: {
      purchaseCompetitorAdSpend: false,
      purchaseCompetitorDevSpend: false,
      purchaseCompetitorDesignRatings: false,
      purchaseCompetitorMarketShare: false,
    },
  };
}
