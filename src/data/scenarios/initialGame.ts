import { GameState, GameSettings } from '../../types/game';
import { CompanyState, WarehouseState } from '../../types/company';
import { EconomyState, MarketState } from '../../types/market';
import { ProductState } from '../../types/product';
import { EmployeeState } from '../../types/personnel';
import { FinanceState } from '../../types/finance';
import { MachineState, VehicleState, MaterialInventory } from '../../types/production';
import { QuarterlyDecisions } from '../../types/decisions';
import { PRODUCT_DEFINITIONS } from '../products';
import { MARKET_DEFINITIONS } from '../markets';
import { table20InterestTax } from '../tables/interestTax';

export function createInitialEconomy(): EconomyState {
  return {
    year: 1,
    quarter: 1,
    gdpIndex: 100.0,
    gdpGrowthRate: 0.015,
    unemploymentRate: 0.055,
    centralBankRate: 0.060, // 6.0%
    inflationRate: 0.024,
    seasonalFactor: 0.92, // Q4 is peak (1.30)
    mode: 'growth',
  };
}

export function createInitialProducts(): ProductState[] {
  return [
    {
      id: 'product1',
      name: PRODUCT_DEFINITIONS.product1.name,
      quality: PRODUCT_DEFINITIONS.product1.baseQuality,
      designRating: PRODUCT_DEFINITIONS.product1.baseDesignRating,
      developmentInvestment: 12000,
      developmentProgress: 0.25,
      developmentOutcome: 'NONE',
      pendingMajorImprovementAvailable: false,
      isModelObsolete: false,
      assemblyTimeMinutes: 45,
      homePrice: 55,
      exportPrice: 52,
      inventory: 400,
      backlog: 0,
      returnedUnits: 0,
      cumulativeSales: 0,
    },
    {
      id: 'product2',
      name: PRODUCT_DEFINITIONS.product2.name,
      quality: PRODUCT_DEFINITIONS.product2.baseQuality,
      designRating: PRODUCT_DEFINITIONS.product2.baseDesignRating,
      developmentInvestment: 18000,
      developmentProgress: 0.20,
      developmentOutcome: 'NONE',
      pendingMajorImprovementAvailable: false,
      isModelObsolete: false,
      assemblyTimeMinutes: 60,
      homePrice: 85,
      exportPrice: 80,
      inventory: 300,
      backlog: 0,
      returnedUnits: 0,
      cumulativeSales: 0,
    },
    {
      id: 'product3',
      name: PRODUCT_DEFINITIONS.product3.name,
      quality: PRODUCT_DEFINITIONS.product3.baseQuality,
      designRating: PRODUCT_DEFINITIONS.product3.baseDesignRating,
      developmentInvestment: 24000,
      developmentProgress: 0.15,
      developmentOutcome: 'NONE',
      pendingMajorImprovementAvailable: false,
      isModelObsolete: false,
      assemblyTimeMinutes: 90,
      homePrice: 135,
      exportPrice: 128,
      inventory: 200,
      backlog: 0,
      returnedUnits: 0,
      cumulativeSales: 0,
    },
  ];
}

export function createInitialMarkets(): MarketState[] {
  return (['south', 'west', 'north', 'export'] as const).map(marketId => ({
    id: marketId,
    name: MARKET_DEFINITIONS[marketId].name,
    demographic: MARKET_DEFINITIONS[marketId].demographic,
    economicSensitivity: 1.0,
    seasonalFactor: 0.92,
    warehouseInventory: {
      product1: marketId === 'south' ? 250 : 50,
      product2: marketId === 'south' ? 180 : 40,
      product3: marketId === 'south' ? 110 : 30,
    },
    orders: { product1: 0, product2: 0, product3: 0 },
    sales: { product1: 0, product2: 0, product3: 0 },
    cancelledOrders: { product1: 0, product2: 0, product3: 0 },
    backlog: { product1: 0, product2: 0, product3: 0 },
    salespeopleAssigned: marketId === 'south' ? 3 : marketId === 'export' ? 1 : 2,
  }));
}

export function createInitialWarehouses(): WarehouseState[] {
  return (['south', 'west', 'north', 'export'] as const).map(marketId => ({
    marketId,
    stock: {
      product1: marketId === 'south' ? 250 : 50,
      product2: marketId === 'south' ? 180 : 40,
      product3: marketId === 'south' ? 110 : 30,
    },
    capacityUnits: 3000,
    averageQuarterlyStock: 300,
  }));
}

export function createInitialEmployees(): EmployeeState {
  return {
    salespeople: 8,
    salespeopleAllocation: { south: 3, west: 2, north: 2, export: 1 },
    salespeopleTrainedRemainingCommitment: 0,
    machinists: 12, // 4 * 3 machines * 1 shift
    assemblyWorkers: 22,
    assemblyWorkersInTraining: 0,
    ancillaryWorkers: 4,
    salespersonBaseSalary: 4200,
    salespersonCommissionRate: 0.025,
    salespersonQuarterlyExpenses: 1500,
    assemblyHourlyWage: 10.50,
    assemblyNextQuarterHourlyWage: 10.50,
    marketingManagementBudget: 8000,
    productionManagementBudget: 8000,
    personnelManagementBudget: 6000,
    financialManagementBudget: 6000,
    pendingBudgetReductions: {},
    salespeopleLeftLastQuarter: 0,
    assemblyWorkersLeftLastQuarter: 0,
  };
}

export function createInitialMachines(): MachineState[] {
  return [
    { id: 'M-01', ageQuarters: 4, efficiency: 0.96, breakdownHoursLastQuarter: 8, preventiveMaintenanceHours: 20, bookValue: 45000 },
    { id: 'M-02', ageQuarters: 3, efficiency: 0.98, breakdownHoursLastQuarter: 6, preventiveMaintenanceHours: 20, bookValue: 46250 },
    { id: 'M-03', ageQuarters: 1, efficiency: 0.99, breakdownHoursLastQuarter: 3, preventiveMaintenanceHours: 20, bookValue: 48750 },
  ];
}

export function createInitialVehicles(): VehicleState[] {
  return [
    { id: 'V-01', capacityUnits: 1200, bookValue: 22500, ageQuarters: 2 },
  ];
}

export function createInitialMaterials(): MaterialInventory {
  return {
    currentStockUnits: 3200,
    pendingOrdersUnits: 0,
    averageUnitCost: 11.20,
  };
}

export function createInitialFinance(cbr: number): FinanceState {
  return {
    cash: 115000,
    debtors: 65000,
    creditors: 32000,
    overdraftLimit: 75000,
    currentOverdraft: 0,
    unsecuredLoans: 0,
    accumulatedTaxLosses: 0,
    taxPayable: 0,
    dividendsPaidThisYear: 0,
    shareCapital: 300000,
    retainedEarnings: 147590,
    lastQuarterNetProfit: 18500,
    propertyValue: 180000,
    creditTermsDays: 30,
    depositRate: Math.max(0.005, cbr + table20InterestTax.depositRateSpread.value),
    overdraftRate: cbr + table20InterestTax.overdraftRateSpread.value,
    unsecuredRate: cbr + table20InterestTax.unsecuredLoanRateSpread.value,
  };
}

export function createCompany(
  id: string,
  name: string,
  isPlayer: boolean,
  strategy?: 'balanced' | 'low-price' | 'premium-quality' | 'marketing-heavy' | 'growth'
): CompanyState {
  const cbr = 0.06;
  return {
    id,
    name,
    isPlayer,
    strategy,
    cash: 115000,
    products: createInitialProducts(),
    markets: createInitialMarkets(),
    employees: createInitialEmployees(),
    machines: createInitialMachines(),
    vehicles: createInitialVehicles(),
    materials: createInitialMaterials(),
    warehouses: createInitialWarehouses(),
    finance: createInitialFinance(cbr),
    marketing: {
      advertising: {
        product1: {
          south: { tradePress: 1200, advertisingSupport: 1500, pointOfSale: 1000 },
          west: { tradePress: 800, advertisingSupport: 1000, pointOfSale: 600 },
          north: { tradePress: 1000, advertisingSupport: 1200, pointOfSale: 800 },
          export: { tradePress: 1500, advertisingSupport: 1200, pointOfSale: 600 },
        },
        product2: {
          south: { tradePress: 1000, advertisingSupport: 1200, pointOfSale: 800 },
          west: { tradePress: 700, advertisingSupport: 800, pointOfSale: 500 },
          north: { tradePress: 900, advertisingSupport: 1000, pointOfSale: 700 },
          export: { tradePress: 1200, advertisingSupport: 1000, pointOfSale: 500 },
        },
        product3: {
          south: { tradePress: 800, advertisingSupport: 1000, pointOfSale: 600 },
          west: { tradePress: 500, advertisingSupport: 700, pointOfSale: 400 },
          north: { tradePress: 700, advertisingSupport: 800, pointOfSale: 500 },
          export: { tradePress: 1000, advertisingSupport: 800, pointOfSale: 400 },
        },
      },
      productImage: { product1: 58, product2: 64, product3: 72 },
      marketShareQuarter: {
        product1: { south: 0.25, west: 0.25, north: 0.25, export: 0.25 },
        product2: { south: 0.25, west: 0.25, north: 0.25, export: 0.25 },
        product3: { south: 0.25, west: 0.25, north: 0.25, export: 0.25 },
      },
      creditTermsDays: 30,
    },
    development: {
      quarterlyBudget: { product1: 3000, product2: 3000, product3: 4000 },
      cumulativeInvestment: { product1: 12000, product2: 18000, product3: 24000 },
      pendingMajorBreakthrough: { product1: false, product2: false, product3: false },
      adoptedMajorBreakthroughs: { product1: 0, product2: 0, product3: 0 },
    },
    operations: {
      shifts: 1,
      contractedMaintenanceHoursPerMachine: 20,
      emergencyRepairHoursLastQuarter: 0,
      machineOrdersPipeline: [],
    },
    sharePrice: 28.50,
  };
}

export function createDefaultQuarterlyDecisions(company: CompanyState): QuarterlyDecisions {
  return {
    marketing: {
      prices: {
        product1: { homePrice: 55, exportPrice: 52 },
        product2: { homePrice: 85, exportPrice: 80 },
        product3: { homePrice: 135, exportPrice: 128 },
      },
      advertising: {
        product1: {
          south: { tradePress: 1200, advertisingSupport: 1500, pointOfSale: 1000 },
          west: { tradePress: 800, advertisingSupport: 1000, pointOfSale: 600 },
          north: { tradePress: 1000, advertisingSupport: 1200, pointOfSale: 800 },
          export: { tradePress: 1500, advertisingSupport: 1200, pointOfSale: 600 },
        },
        product2: {
          south: { tradePress: 1000, advertisingSupport: 1200, pointOfSale: 800 },
          west: { tradePress: 700, advertisingSupport: 800, pointOfSale: 500 },
          north: { tradePress: 900, advertisingSupport: 1000, pointOfSale: 700 },
          export: { tradePress: 1200, advertisingSupport: 1000, pointOfSale: 500 },
        },
        product3: {
          south: { tradePress: 800, advertisingSupport: 1000, pointOfSale: 600 },
          west: { tradePress: 500, advertisingSupport: 700, pointOfSale: 400 },
          north: { tradePress: 700, advertisingSupport: 800, pointOfSale: 500 },
          export: { tradePress: 1000, advertisingSupport: 800, pointOfSale: 400 },
        },
      },
      developmentBudgets: {
        product1: 3000,
        product2: 3000,
        product3: 4000,
      },
      adoptMajorImprovement: {
        product1: false,
        product2: false,
        product3: false,
      },
      creditTermsDays: 30,
    },
    operations: {
      deliveryQuantities: {
        product1: { south: 450, west: 300, north: 350, export: 400 },
        product2: { south: 250, west: 200, north: 220, export: 250 },
        product3: { south: 140, west: 100, north: 110, export: 130 },
      },
      assemblyTimeMinutes: {
        product1: 45,
        product2: 60,
        product3: 90,
      },
      shifts: 1,
      contractedMaintenanceHoursPerMachine: 20,
      materialOrder: {
        supplierId: 1,
        units: 2400,
      },
      machinesToOrder: 0,
      machinesToSell: 0,
      vehiclesToBuy: 0,
      vehiclesToSell: 0,
    },
    personnel: {
      salespeopleHires: 0,
      salespeopleDismissals: 0,
      salespeopleToTrain: 0,
      salespeopleAllocation: {
        south: 3,
        west: 2,
        north: 2,
        export: 1,
      },
      assemblyHires: 0,
      assemblyDismissals: 0,
      assemblyToTrain: 0,
      assemblyHourlyWageOffer: company.employees.assemblyHourlyWage,
      marketingManagementBudget: 8000,
      productionManagementBudget: 8000,
      personnelManagementBudget: 6000,
      financialManagementBudget: 6000,
    },
    finance: {
      dividendPerShare: 0,
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

export function createNewGame(settings?: Partial<GameSettings>): GameState {
  const seed = settings?.seed ?? Math.floor(Date.now() % 1000000);
  const companyName = settings?.companyName?.trim() || 'Aura Manufacturing Corp';
  const player = createCompany('player-company', companyName, true);
  
  const competitors: CompanyState[] = [
    createCompany('comp-1', 'Apex Dynamics Ltd', false, 'premium-quality'),
    createCompany('comp-2', 'Vanguard Industries', false, 'low-price'),
    createCompany('comp-3', 'Sterling Products', false, 'marketing-heavy'),
  ];

  const now = Date.now();
  const initialHistory = [{
    year: 1,
    quarter: 1 as const,
    revenue: 165000,
    profit: 18500,
    cash: player.cash,
    debt: player.finance.currentOverdraft + player.finance.unsecuredLoans,
    inventory: 900,
    marketShare: 0.25,
    sharePrice: player.sharePrice,
    employees: player.employees.salespeople + player.employees.machinists + player.employees.assemblyWorkers + player.employees.ancillaryWorkers,
    production: 1500,
    sales: 1480,
    netWorth: 447590,
  }];

  return {
    id: `game-${now}-${Math.floor(Math.random() * 1000)}`,
    name: `${companyName} Simulation`,
    seed,
    year: 1,
    quarter: 1,
    economy: createInitialEconomy(),
    player,
    competitors,
    decisions: [],
    reports: [],
    history: initialHistory,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}
