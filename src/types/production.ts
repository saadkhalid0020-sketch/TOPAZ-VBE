import { ProductId } from './product';

export type ShiftLevel = 1 | 2 | 3;

export interface MachineOrderPipeline {
  id: string;
  quarterOrdered: { year: number; quarter: number };
  quantity: number;
  totalCost: number;
  firstPaymentPaid: boolean; // 50% paid in T+1
  secondPaymentPaid: boolean; // 50% paid in T+2 (installation)
  operationalQuarter: { year: number; quarter: number }; // T+3
}

export interface MachineState {
  id: string;
  ageQuarters: number;
  efficiency: number; // 0 to 1 scale (e.g. 0.95 = 95%)
  breakdownHoursLastQuarter: number;
  preventiveMaintenanceHours: number;
  bookValue: number;
}

export interface VehicleState {
  id: string;
  capacityUnits: number;
  bookValue: number;
  ageQuarters: number;
}

export interface MaterialInventory {
  currentStockUnits: number; // Basic material in units
  pendingOrdersUnits: number;
  averageUnitCost: number;
}

export interface ProductionCapacityInfo {
  machineCapacityUnits: number;
  assemblyCapacityUnits: number;
  limitingFactor: 'machining' | 'assembly' | 'balanced';
  effectiveCapacityUnits: number;
  requestedUnits: number;
  isRestricted: boolean;
  actualProductionUnits: Record<ProductId, number>;
  rejectedUnits: Record<ProductId, number>;
  scrapIncome: number;
}
