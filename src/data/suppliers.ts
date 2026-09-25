import { table14SupplierTerms } from './tables/supplierTerms';

export interface SupplierDefinition {
  id: 0 | 1 | 2 | 3;
  name: string;
  description: string;
  basePrice: number;
  deliveryPattern: string;
  minimumOrder: number;
  requiresStorage: boolean;
  volumeDiscounts: Array<{ threshold: number; discountPercent: number }>;
}

export const SUPPLIER_DEFINITIONS: Record<0 | 1 | 2 | 3, SupplierDefinition> = {
  0: {
    id: 0,
    name: table14SupplierTerms.supplier0.name,
    description: table14SupplierTerms.supplier0.description,
    basePrice: table14SupplierTerms.supplier0.basePricePerUnit.value,
    deliveryPattern: 'Immediate Just-In-Time (No inventory warehouse holding cost)',
    minimumOrder: table14SupplierTerms.supplier0.minimumOrderQuantity.value,
    requiresStorage: false,
    volumeDiscounts: table14SupplierTerms.supplier0.volumeDiscountTiers,
  },
  1: {
    id: 1,
    name: table14SupplierTerms.supplier1.name,
    description: table14SupplierTerms.supplier1.description,
    basePrice: table14SupplierTerms.supplier1.basePricePerUnit.value,
    deliveryPattern: '3 Equal Staggered Deliveries throughout the quarter',
    minimumOrder: table14SupplierTerms.supplier1.minimumOrderQuantity.value,
    requiresStorage: true,
    volumeDiscounts: table14SupplierTerms.supplier1.volumeDiscountTiers,
  },
  2: {
    id: 2,
    name: table14SupplierTerms.supplier2.name,
    description: table14SupplierTerms.supplier2.description,
    basePrice: table14SupplierTerms.supplier2.basePricePerUnit.value,
    deliveryPattern: '6 Staggered Deliveries throughout the quarter with tiered discounts',
    minimumOrder: table14SupplierTerms.supplier2.minimumOrderQuantity.value,
    requiresStorage: true,
    volumeDiscounts: table14SupplierTerms.supplier2.volumeDiscountTiers,
  },
  3: {
    id: 3,
    name: table14SupplierTerms.supplier3.name,
    description: table14SupplierTerms.supplier3.description,
    basePrice: table14SupplierTerms.supplier3.basePricePerUnit.value,
    deliveryPattern: '12 Weekly scheduled contract deliveries with maximum volume rebates',
    minimumOrder: table14SupplierTerms.supplier3.minimumOrderQuantity.value,
    requiresStorage: true,
    volumeDiscounts: table14SupplierTerms.supplier3.volumeDiscountTiers,
  },
};
