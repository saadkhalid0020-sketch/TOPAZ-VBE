import { ProductDefinition, ProductId } from '../types/product';

export const PRODUCT_DEFINITIONS: Record<ProductId, ProductDefinition> = {
  product1: {
    id: 'product1',
    name: 'Topaz Alpha (Standard)',
    code: 'P1-STD',
    description: 'High-volume entry consumer product with 45-minute assembly and 1.0 material unit requirement.',
    standardAssemblyMinutes: 45,
    basicMaterialUnits: 1.0,
    baseDesignRating: 50,
    baseQuality: 60,
  },
  product2: {
    id: 'product2',
    name: 'Topaz Beta (Deluxe)',
    code: 'P2-DLX',
    description: 'Mid-range consumer product with enhanced features, 60-minute assembly, and 1.5 material units.',
    standardAssemblyMinutes: 60,
    basicMaterialUnits: 1.5,
    baseDesignRating: 60,
    baseQuality: 68,
  },
  product3: {
    id: 'product3',
    name: 'Topaz Gamma (Executive)',
    code: 'P3-EXE',
    description: 'Premium consumer product with precision engineering, 90-minute assembly, and 2.0 material units.',
    standardAssemblyMinutes: 90,
    basicMaterialUnits: 2.0,
    baseDesignRating: 75,
    baseQuality: 80,
  },
};
