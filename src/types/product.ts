export type ProductId = 'product1' | 'product2' | 'product3';

export type DevelopmentOutcome = 'NONE' | 'MINOR' | 'MAJOR';

export interface ProductDefinition {
  id: ProductId;
  name: string;
  code: string;
  description: string;
  standardAssemblyMinutes: number;
  basicMaterialUnits: number;
  baseDesignRating: number;
  baseQuality: number;
}

export interface ProductState {
  id: ProductId;
  name: string;
  quality: number; // 0 to 100 scale
  designRating: number; // 0 to 100 scale
  developmentInvestment: number; // Cumulative spend in currency
  developmentProgress: number; // Cumulative progress towards breakthroughs
  developmentOutcome: DevelopmentOutcome;
  pendingMajorImprovementAvailable: boolean; // Player must decide whether to adopt
  isModelObsolete: boolean;
  assemblyTimeMinutes: number; // Actual assembly time chosen (minutes)
  homePrice: number; // South, West, North price
  exportPrice: number; // Export market price (0 = not offered)
  inventory: number; // Finished stock across factory/central
  backlog: number; // Outstanding unfulfilled orders
  returnedUnits: number; // Under guarantee
  cumulativeSales: number;
}
