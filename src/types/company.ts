import { ProductId, ProductState } from './product';
import { MarketId, MarketState } from './market';
import { EmployeeState } from './personnel';
import { FinanceState } from './finance';
import { MachineState, VehicleState, MaterialInventory, MachineOrderPipeline, ShiftLevel } from './production';

export interface WarehouseState {
  marketId: MarketId;
  stock: Record<ProductId, number>;
  capacityUnits: number;
  averageQuarterlyStock: number;
}

export interface MarketingMediaExpenditure {
  tradePress: number;
  advertisingSupport: number;
  pointOfSale: number;
}

export interface MarketingState {
  advertising: Record<ProductId, Record<MarketId, MarketingMediaExpenditure>>;
  productImage: Record<ProductId, number>; // Cumulative score
  marketShareQuarter: Record<ProductId, Record<MarketId, number>>;
  creditTermsDays: number;
}

export interface DevelopmentState {
  quarterlyBudget: Record<ProductId, number>;
  cumulativeInvestment: Record<ProductId, number>;
  pendingMajorBreakthrough: Record<ProductId, boolean>;
  adoptedMajorBreakthroughs: Record<ProductId, number>; // Count of major releases
}

export interface OperationsState {
  shifts: ShiftLevel;
  contractedMaintenanceHoursPerMachine: number;
  emergencyRepairHoursLastQuarter: number;
  machineOrdersPipeline: MachineOrderPipeline[];
}

export interface CompanyState {
  id: string;
  name: string;
  isPlayer: boolean;
  strategy?: 'balanced' | 'low-price' | 'premium-quality' | 'marketing-heavy' | 'growth';
  
  cash: number;
  products: ProductState[];
  markets: MarketState[];
  employees: EmployeeState;
  machines: MachineState[];
  vehicles: VehicleState[];
  materials: MaterialInventory;
  warehouses: WarehouseState[];
  finance: FinanceState;
  marketing: MarketingState;
  development: DevelopmentState;
  operations: OperationsState;
  
  sharePrice: number;
}
