import { ProductId } from './product';

export type MarketId = 'south' | 'west' | 'north' | 'export';

export interface DemographicProfile {
  name: string;
  populationIndex: number;
  incomeIndex: number;
  commercialActivityIndex: number;
  distanceFromFactoryKm: number; // South is 0 km (factory located here)
}

export interface EconomyState {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  gdpIndex: number; // Base 100
  gdpGrowthRate: number; // e.g. 0.015 (1.5%)
  unemploymentRate: number; // e.g. 0.055 (5.5%)
  centralBankRate: number; // e.g. 0.06 (6.0%)
  inflationRate: number; // e.g. 0.025 (2.5%)
  seasonalFactor: number; // Q4 peak
  mode: 'static' | 'growth' | 'decline';
}

export interface MarketState {
  id: MarketId;
  name: string;
  demographic: DemographicProfile;
  economicSensitivity: number; // Elasticity to GDP
  seasonalFactor: number;
  warehouseInventory: Record<ProductId, number>;
  orders: Record<ProductId, number>;
  sales: Record<ProductId, number>;
  cancelledOrders: Record<ProductId, number>;
  backlog: Record<ProductId, number>;
  salespeopleAssigned: number;
}
