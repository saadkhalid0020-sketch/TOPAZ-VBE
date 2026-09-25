import { GameState, HistoricalSnapshot } from '../../types/game';
import { QuarterlyDecisions } from '../../types/decisions';
import { QuarterlyReport, CompetitorIntelItem } from '../../types/reports';
import { CompanyState } from '../../types/company';
import { createRNG } from '../../utils/random';
import { advanceEconomy } from '../economy/economyEngine';
import { processMarketingAndRAndD } from '../marketing/marketingEngine';
import { simulateMarketDemand } from '../market/marketEngine';
import { executeProduction } from '../production/productionEngine';
import { executeLogistics } from '../logistics/logisticsEngine';
import { executePersonnel } from '../personnel/personnelEngine';
import { executeFinance } from '../finance/financeEngine';
import { generateCompetitorDecisions } from '../competitors/competitorAI';
import { table21InventoryValuation } from '../../data/tables/inventoryValuation';
import { roundCurrency } from '../../utils/rounding';
import { safeDivide } from '../../utils/math';

export interface SimulationResult {
  nextGameState: GameState;
  report: QuarterlyReport;
}

/**
 * Deterministic Simulation Engine Runner.
 * Executes one complete quarterly business cycle.
 * Does not mutate the input game state; returns fresh immutable state.
 */
export function runQuarter(
  currentState: GameState,
  playerDecisions: QuarterlyDecisions
): SimulationResult {
  // Deterministic seed generation based on game seed and quarterly index
  const quarterIndex = currentState.year * 4 + currentState.quarter;
  const rng = createRNG(currentState.seed + quarterIndex * 9973);

  // 1. Advance Economy
  const nextEconomy = advanceEconomy(currentState.economy, rng);

  // 2. Generate Decisions for Computer-Controlled Competitors
  const competitorDecisions = currentState.competitors.map(comp => ({
    company: comp,
    decisions: generateCompetitorDecisions(comp, nextEconomy, rng),
  }));

  // 3. Process Player Marketing & R&D
  const playerMarketingResult = processMarketingAndRAndD(
    currentState.player.products,
    playerDecisions.marketing,
    rng
  );

  // 4. Process Player Production & Operations
  const playerProductionResult = executeProduction(
    currentState.player,
    playerDecisions.operations,
    rng
  );

  // 5. Process Player Logistics & Warehousing
  const playerLogisticsResult = executeLogistics(
    currentState.player,
    playerDecisions.operations,
    playerProductionResult.capacityInfo.actualProductionUnits
  );

  // Combine products with updated inventory after production and logistics
  const playerProductsAfterOperations = playerMarketingResult.updatedProducts.map(p => {
    const prodId = p.id;
    const addedUnits = playerProductionResult.capacityInfo.actualProductionUnits[prodId] || 0;
    return {
      ...p,
      inventory: p.inventory + addedUnits,
    };
  });

  // Prepare temporary player state for market demand simulation
  const tempPlayerCompany: CompanyState = {
    ...currentState.player,
    products: playerProductsAfterOperations,
    warehouses: playerLogisticsResult.updatedWarehouses,
    marketing: {
      ...currentState.player.marketing,
      productImage: playerMarketingResult.productImages,
      creditTermsDays: playerDecisions.marketing.creditTermsDays,
    },
  };

  // 6. Simulate Market Demand & Orders
  const marketResult = simulateMarketDemand(
    tempPlayerCompany,
    currentState.competitors,
    nextEconomy,
    rng
  );

  // Update warehouse stock and product inventory post-sales fulfillment
  const finalWarehouses = playerLogisticsResult.updatedWarehouses.map(w => {
    const newStock = { ...w.stock };
    for (const prodId of ['product1', 'product2', 'product3'] as const) {
      const sold = marketResult.actualSales[prodId]?.[w.marketId] || 0;
      newStock[prodId] = Math.max(0, newStock[prodId] - sold);
    }
    return { ...w, stock: newStock };
  });

  const finalProducts = playerProductsAfterOperations.map(p => {
    const prodId = p.id;
    let totalSoldAcrossMarkets = 0;
    let totalBacklogAcrossMarkets = 0;
    for (const mkt of ['south', 'west', 'north', 'export'] as const) {
      totalSoldAcrossMarkets += marketResult.actualSales[prodId]?.[mkt] || 0;
      totalBacklogAcrossMarkets += marketResult.unfulfilledBacklog[prodId]?.[mkt] || 0;
    }

    return {
      ...p,
      backlog: totalBacklogAcrossMarkets,
      cumulativeSales: p.cumulativeSales + totalSoldAcrossMarkets,
      returnedUnits: playerProductionResult.guaranteeReturns[prodId] || 0,
      inventory: Math.max(0, p.inventory - totalSoldAcrossMarkets),
    };
  });

  // 7. Execute Personnel
  const playerPersonnelResult = executePersonnel(
    currentState.player.employees,
    playerDecisions.personnel,
    playerProductionResult.updatedMachines.length,
    playerDecisions.operations.shifts,
    nextEconomy,
    rng
  );

  // 8. Cost of Goods Sold (Absorption costing)
  let costOfGoodsSold = 0;
  for (const prodId of ['product1', 'product2', 'product3'] as const) {
    let unitsSold = 0;
    for (const mkt of ['south', 'west', 'north', 'export'] as const) {
      unitsSold += marketResult.actualSales[prodId]?.[mkt] || 0;
    }
    const unitStdCost = table21InventoryValuation.standardProductUnitCosts[prodId].value;
    costOfGoodsSold += unitsSold * unitStdCost;
  }
  costOfGoodsSold = roundCurrency(costOfGoodsSold);

  // Total wages and salaries
  const totalSalariesAndWages = roundCurrency(
    playerPersonnelResult.salesSalariesTotal +
    playerPersonnelResult.machinistsWagesTotal +
    playerPersonnelResult.assemblyWagesTotal +
    playerPersonnelResult.ancillaryWagesTotal +
    playerPersonnelResult.recruitmentAndTrainingCostsTotal +
    playerPersonnelResult.dismissalCompensationTotal
  );

  // 9. Execute Finance & Accounting
  const financeResult = executeFinance(tempPlayerCompany, {
    deliveredSalesRevenue: marketResult.salesValueTotal,
    costOfGoodsSold,
    totalAdvertisingExpense: playerMarketingResult.totalAdvertisingSpend,
    salariesAndWages: totalSalariesAndWages,
    salesCommissions: marketResult.salesCommissionsTotal,
    salesExpenses: playerPersonnelResult.salesExpensesTotal,
    sellingOfficeOverhead: marketResult.sellingOfficeOverheadTotal,
    transportCosts: playerLogisticsResult.transportCostsTotal,
    warehousingCosts: playerLogisticsResult.warehousingCostsTotal,
    maintenanceExpense: playerProductionResult.maintenanceCostTotal,
    productDevelopmentExpense: playerMarketingResult.totalDevSpend,
    managementBudgetExpense: playerPersonnelResult.managementBudgetTotal,
    scrapIncome: playerProductionResult.scrapIncomeTotal,
    guaranteeServiceExpense: playerProductionResult.guaranteeServicingCostTotal,
    purchasingAdminCost: playerLogisticsResult.purchasingAdminCost,
    materialOrderCost: playerLogisticsResult.materialOrderCost,
    researchDecisions: playerDecisions.research,
    financeDecisions: playerDecisions.finance,
    machinesOrderedCount: playerDecisions.operations.machinesToOrder,
    machinesSoldBookValue: 0,
    machinesSoldRealizedCash: 0,
    economy: nextEconomy,
    marketShare: marketResult.companyOverallMarketShare,
    capacityUtilization: safeDivide(
      playerProductionResult.capacityInfo.requestedUnits,
      playerProductionResult.capacityInfo.effectiveCapacityUnits,
      0.8
    ),
    customerSatisfactionScore: Math.round(
      (playerMarketingResult.productImages.product1 +
        playerMarketingResult.productImages.product2 +
        playerMarketingResult.productImages.product3) /
        3
    ),
  });

  // 10. Assemble Updated Player Company State
  const updatedPlayerCompany: CompanyState = {
    ...currentState.player,
    cash: financeResult.updatedFinance.cash,
    products: finalProducts,
    markets: currentState.player.markets.map(m => ({
      ...m,
      warehouseInventory: finalWarehouses.find(w => w.marketId === m.id)?.stock || m.warehouseInventory,
      orders: {
        product1: marketResult.ordersReceived.product1[m.id],
        product2: marketResult.ordersReceived.product2[m.id],
        product3: marketResult.ordersReceived.product3[m.id],
      },
      sales: {
        product1: marketResult.actualSales.product1[m.id],
        product2: marketResult.actualSales.product2[m.id],
        product3: marketResult.actualSales.product3[m.id],
      },
      cancelledOrders: {
        product1: marketResult.cancelledOrders.product1[m.id],
        product2: marketResult.cancelledOrders.product2[m.id],
        product3: marketResult.cancelledOrders.product3[m.id],
      },
      backlog: {
        product1: marketResult.unfulfilledBacklog.product1[m.id],
        product2: marketResult.unfulfilledBacklog.product2[m.id],
        product3: marketResult.unfulfilledBacklog.product3[m.id],
      },
      salespeopleAssigned: playerPersonnelResult.updatedEmployees.salespeopleAllocation[m.id] || 0,
    })),
    employees: playerPersonnelResult.updatedEmployees,
    machines: playerProductionResult.updatedMachines,
    vehicles: playerLogisticsResult.updatedVehicles,
    materials: {
      currentStockUnits: playerProductionResult.updatedMaterialsInventory + playerLogisticsResult.materialDeliveredUnits,
      pendingOrdersUnits: 0,
      averageUnitCost: 11.20,
    },
    warehouses: finalWarehouses,
    finance: financeResult.updatedFinance,
    marketing: {
      advertising: playerDecisions.marketing.advertising,
      productImage: playerMarketingResult.productImages,
      marketShareQuarter: marketResult.marketShareQuarter,
      creditTermsDays: playerDecisions.marketing.creditTermsDays,
    },
    development: {
      quarterlyBudget: playerDecisions.marketing.developmentBudgets,
      cumulativeInvestment: {
        product1: finalProducts.find(p => p.id === 'product1')?.developmentInvestment || 0,
        product2: finalProducts.find(p => p.id === 'product2')?.developmentInvestment || 0,
        product3: finalProducts.find(p => p.id === 'product3')?.developmentInvestment || 0,
      },
      pendingMajorBreakthrough: {
        product1: finalProducts.find(p => p.id === 'product1')?.pendingMajorImprovementAvailable || false,
        product2: finalProducts.find(p => p.id === 'product2')?.pendingMajorImprovementAvailable || false,
        product3: finalProducts.find(p => p.id === 'product3')?.pendingMajorImprovementAvailable || false,
      },
      adoptedMajorBreakthroughs: {
        product1: currentState.player.development.adoptedMajorBreakthroughs.product1 + (playerDecisions.marketing.adoptMajorImprovement.product1 ? 1 : 0),
        product2: currentState.player.development.adoptedMajorBreakthroughs.product2 + (playerDecisions.marketing.adoptMajorImprovement.product2 ? 1 : 0),
        product3: currentState.player.development.adoptedMajorBreakthroughs.product3 + (playerDecisions.marketing.adoptMajorImprovement.product3 ? 1 : 0),
      },
    },
    operations: {
      shifts: playerDecisions.operations.shifts,
      contractedMaintenanceHoursPerMachine: playerDecisions.operations.contractedMaintenanceHoursPerMachine,
      emergencyRepairHoursLastQuarter: playerProductionResult.emergencyRepairHours,
      machineOrdersPipeline: financeResult.updatedMachinePipeline,
    },
    sharePrice: financeResult.newSharePrice,
  };

  // 11. Update Competitors (Deterministic evolution)
  const updatedCompetitors: CompanyState[] = competitorDecisions.map(({ company: comp, decisions: compDecs }) => {
    const compMarketing = processMarketingAndRAndD(comp.products, compDecs.marketing, rng);
    const compProd = executeProduction(comp, compDecs.operations, rng);
    const compLog = executeLogistics(comp, compDecs.operations, compProd.capacityInfo.actualProductionUnits);
    const compPers = executePersonnel(comp.employees, compDecs.personnel, compProd.updatedMachines.length, compDecs.operations.shifts, nextEconomy, rng);

    // Share price calculation for competitor
    const compNetProfit = roundCurrency((comp.finance.lastQuarterNetProfit || 15000) * (rng.nextFloat(0.9, 1.15)));
    const compNetWorth = comp.finance.shareCapital + comp.finance.retainedEarnings + compNetProfit;
    const compSharePrice = roundCurrency(
      Math.max(1.0, (compNetWorth / 100000) * 0.4 + (compNetProfit * 4 / 100000) * 10 * 0.6)
    );

    return {
      ...comp,
      cash: Math.max(10000, comp.cash + compNetProfit * 0.8),
      products: compMarketing.updatedProducts,
      employees: compPers.updatedEmployees,
      machines: compProd.updatedMachines,
      vehicles: compLog.updatedVehicles,
      warehouses: compLog.updatedWarehouses,
      finance: {
        ...comp.finance,
        lastQuarterNetProfit: compNetProfit,
        retainedEarnings: comp.finance.retainedEarnings + compNetProfit,
      },
      marketing: {
        ...comp.marketing,
        productImage: compMarketing.productImages,
      },
      sharePrice: compSharePrice,
    };
  });

  // 12. Assemble Competitor Intelligence Report
  const competitorsIntel: CompetitorIntelItem[] = updatedCompetitors.map(comp => {
    const intel: CompetitorIntelItem = {
      id: comp.id,
      name: comp.name,
      sharePrice: comp.sharePrice,
      publicData: {
        prices: {
          product1: { home: comp.products.find(p => p.id === 'product1')?.homePrice || 55, export: comp.products.find(p => p.id === 'product1')?.exportPrice || 52 },
          product2: { home: comp.products.find(p => p.id === 'product2')?.homePrice || 85, export: comp.products.find(p => p.id === 'product2')?.exportPrice || 80 },
          product3: { home: comp.products.find(p => p.id === 'product3')?.homePrice || 135, export: comp.products.find(p => p.id === 'product3')?.exportPrice || 128 },
        },
        totalEmployees: comp.employees.salespeople + comp.employees.machinists + comp.employees.assemblyWorkers + comp.employees.ancillaryWorkers,
        assemblyHourlyWage: comp.employees.assemblyHourlyWage,
      },
    };

    if (playerDecisions.research.purchaseCompetitorAdSpend || playerDecisions.research.purchaseCompetitorDevSpend || playerDecisions.research.purchaseCompetitorDesignRatings || playerDecisions.research.purchaseCompetitorMarketShare) {
      intel.purchasedData = {};
      if (playerDecisions.research.purchaseCompetitorAdSpend) {
        intel.purchasedData.advertisingSpendTotal = roundCurrency(22000 * rng.nextFloat(0.85, 1.25));
      }
      if (playerDecisions.research.purchaseCompetitorDevSpend) {
        intel.purchasedData.rAndDSpendTotal = roundCurrency(10000 * rng.nextFloat(0.80, 1.20));
      }
      if (playerDecisions.research.purchaseCompetitorDesignRatings) {
        intel.purchasedData.designRatings = {
          product1: comp.products.find(p => p.id === 'product1')?.designRating || 50,
          product2: comp.products.find(p => p.id === 'product2')?.designRating || 60,
          product3: comp.products.find(p => p.id === 'product3')?.designRating || 75,
        };
      }
      if (playerDecisions.research.purchaseCompetitorMarketShare) {
        intel.purchasedData.marketShareEstimate = roundCurrency(0.25 * rng.nextFloat(0.85, 1.15));
      }
    }

    return intel;
  });

  // 13. Construct Comprehensive Quarterly Management Report
  const keyHighlights: string[] = [];
  const criticalWarnings: string[] = [];

  const shareDelta = roundCurrency(financeResult.newSharePrice - currentState.player.sharePrice);
  if (shareDelta > 0) keyHighlights.push(`Share price appreciated by +$${shareDelta.toFixed(2)} to $${financeResult.newSharePrice.toFixed(2)}.`);
  else if (shareDelta < 0) criticalWarnings.push(`Share price declined by -$${Math.abs(shareDelta).toFixed(2)} to $${financeResult.newSharePrice.toFixed(2)}.`);

  if (financeResult.incomeStatement.netProfit > 0) {
    keyHighlights.push(`Company generated net profit of $${financeResult.incomeStatement.netProfit.toLocaleString()}.`);
  } else {
    criticalWarnings.push(`Company posted a quarterly net loss of ($${Math.abs(financeResult.incomeStatement.netProfit).toLocaleString()}).`);
  }

  if (playerProductionResult.capacityInfo.isRestricted) {
    criticalWarnings.push('Production schedule exceeded available capacity. Actual output was restricted proportionally.');
  }

  if (playerProductionResult.totalBreakdownHours > 20) {
    criticalWarnings.push(`Machinery experienced ${playerProductionResult.totalBreakdownHours} hours of unscheduled downtime.`);
  }

  if (playerLogisticsResult.hiredLorryTrips > 0) {
    keyHighlights.push(`Dispatched ${playerLogisticsResult.hiredLorryTrips} hired lorries to support peak distribution volume.`);
  }

  for (const prodId of ['product1', 'product2', 'product3'] as const) {
    if (playerMarketingResult.outcomes[prodId] === 'MAJOR') {
      keyHighlights.push(`R&D Breakthrough! Major improvement unlocked for ${prodId.toUpperCase()}. Available for adoption next quarter.`);
    }
  }

  const report: QuarterlyReport = {
    id: `rep-${currentState.year}-Q${currentState.quarter}-${Date.now()}`,
    gameId: currentState.id,
    year: currentState.year,
    quarter: currentState.quarter,
    timestamp: Date.now(),
    economy: nextEconomy,
    marketing: {
      prices: {
        product1: { home: playerDecisions.marketing.prices.product1.homePrice, export: playerDecisions.marketing.prices.product1.exportPrice },
        product2: { home: playerDecisions.marketing.prices.product2.homePrice, export: playerDecisions.marketing.prices.product2.exportPrice },
        product3: { home: playerDecisions.marketing.prices.product3.homePrice, export: playerDecisions.marketing.prices.product3.exportPrice },
      },
      ordersReceived: marketResult.ordersReceived,
      actualSalesUnits: marketResult.actualSales,
      unfulfilledBacklog: marketResult.unfulfilledBacklog,
      cancelledOrdersUnits: marketResult.cancelledOrders,
      advertisingSpendTotal: playerMarketingResult.advertisingTotals,
      productDevelopmentSpend: playerDecisions.marketing.developmentBudgets,
      productDevelopmentResult: playerMarketingResult.outcomes,
      productImageScores: playerMarketingResult.productImages,
      marketSharePercentages: marketResult.marketShareQuarter,
      overallMarketShare: marketResult.companyOverallMarketShare,
    },
    operations: {
      capacity: playerProductionResult.capacityInfo,
      machineCount: playerProductionResult.updatedMachines.length,
      activeShifts: playerDecisions.operations.shifts,
      machineEfficiencyAverage: roundCurrency(
        playerProductionResult.updatedMachines.reduce((a, m) => a + m.efficiency, 0) / playerProductionResult.updatedMachines.length
      ),
      totalBreakdownHours: playerProductionResult.totalBreakdownHours,
      contractedMaintenanceHours: playerProductionResult.contractedMaintenanceHours,
      emergencyRepairHours: playerProductionResult.emergencyRepairHours,
      maintenanceCost: playerProductionResult.maintenanceCostTotal,
      finishedGoodsInventoryQuarterEnd: {
        product1: finalProducts.find(p => p.id === 'product1')?.inventory || 0,
        product2: finalProducts.find(p => p.id === 'product2')?.inventory || 0,
        product3: finalProducts.find(p => p.id === 'product3')?.inventory || 0,
      },
      rawMaterialClosingStock: updatedPlayerCompany.materials.currentStockUnits,
      materialOrdersDelivered: playerLogisticsResult.materialDeliveredUnits,
      transportMethod: {
        ownVehiclesTrips: playerLogisticsResult.ownVehicleTrips,
        hiredTransportTrips: playerLogisticsResult.hiredLorryTrips,
        totalTransportCost: playerLogisticsResult.transportCostsTotal,
      },
      warehousingCostTotal: playerLogisticsResult.warehousingCostsTotal,
      guaranteeReturnsCount: playerProductionResult.guaranteeReturns,
      guaranteeServiceCost: playerProductionResult.guaranteeServicingCostTotal,
    },
    personnel: {
      salespeopleCount: playerPersonnelResult.updatedEmployees.salespeople,
      salespeopleRecruited: playerPersonnelResult.salesRecruitedCount,
      salespeopleTurnover: playerPersonnelResult.salesTurnoverCount,
      salespeopleAllocation: playerPersonnelResult.updatedEmployees.salespeopleAllocation,
      machinistsCount: playerPersonnelResult.updatedEmployees.machinists,
      assemblyWorkersCount: playerPersonnelResult.updatedEmployees.assemblyWorkers,
      assemblyRecruited: playerPersonnelResult.assemblyRecruitedCount,
      assemblyTurnover: playerPersonnelResult.assemblyTurnoverCount,
      assemblyHourlyWageCurrent: playerPersonnelResult.updatedEmployees.assemblyHourlyWage,
      totalWagesPaid: totalSalariesAndWages,
      managementBudgetSpent: playerPersonnelResult.managementBudgetTotal,
    },
    incomeStatement: financeResult.incomeStatement,
    balanceSheet: financeResult.balanceSheet,
    cashFlowStatement: financeResult.cashFlowStatement,
    competitorsIntel,
    executiveSummary: {
      revenue: financeResult.incomeStatement.revenue,
      grossProfit: financeResult.incomeStatement.grossProfit,
      netProfit: financeResult.incomeStatement.netProfit,
      cashPosition: financeResult.balanceSheet.cash,
      sharePrice: financeResult.newSharePrice,
      sharePriceChange: shareDelta,
      keyHighlights,
      criticalWarnings,
    },
  };

  // 14. Create Historical Snapshot
  const totalEmployees =
    updatedPlayerCompany.employees.salespeople +
    updatedPlayerCompany.employees.machinists +
    updatedPlayerCompany.employees.assemblyWorkers +
    updatedPlayerCompany.employees.ancillaryWorkers;

  const totalProduction =
    playerProductionResult.capacityInfo.actualProductionUnits.product1 +
    playerProductionResult.capacityInfo.actualProductionUnits.product2 +
    playerProductionResult.capacityInfo.actualProductionUnits.product3;

  let totalSales = 0;
  for (const prodId of ['product1', 'product2', 'product3'] as const) {
    for (const mkt of ['south', 'west', 'north', 'export'] as const) {
      totalSales += marketResult.actualSales[prodId][mkt];
    }
  }

  const snapshot: HistoricalSnapshot = {
    year: currentState.year,
    quarter: currentState.quarter,
    revenue: financeResult.incomeStatement.revenue,
    profit: financeResult.incomeStatement.netProfit,
    cash: financeResult.balanceSheet.cash,
    debt: financeResult.balanceSheet.overdraft + financeResult.balanceSheet.unsecuredLoans,
    inventory: updatedPlayerCompany.materials.currentStockUnits,
    marketShare: marketResult.companyOverallMarketShare,
    sharePrice: financeResult.newSharePrice,
    employees: totalEmployees,
    production: totalProduction,
    sales: totalSales,
    netWorth: financeResult.balanceSheet.totalAssets - financeResult.balanceSheet.totalCurrentLiabilities,
  };

  // 15. Advance to Next Quarter
  const nextQuarter = (currentState.quarter === 4 ? 1 : currentState.quarter + 1) as 1 | 2 | 3 | 4;
  const nextYear = currentState.quarter === 4 ? currentState.year + 1 : currentState.year;

  const nextGameState: GameState = {
    ...currentState,
    year: nextYear,
    quarter: nextQuarter,
    economy: nextEconomy,
    player: updatedPlayerCompany,
    competitors: updatedCompetitors,
    decisions: [
      ...currentState.decisions,
      {
        year: currentState.year,
        quarter: currentState.quarter,
        decisions: playerDecisions,
        submittedAt: Date.now(),
      },
    ],
    reports: [report, ...currentState.reports],
    history: [...currentState.history, snapshot],
    updatedAt: Date.now(),
  };

  return {
    nextGameState,
    report,
  };
}
