import { createConfigParam } from '../../types/config';

// Table 14: Supplier Terms
// Four suppliers:
// Supplier 0: Local, Just-in-time, no storage requirement
// Supplier 1: Regional, 3 equal deliveries
// Supplier 2: National, 6 equal deliveries, quantity discounts
// Supplier 3: Global/contract, 12 weekly deliveries, largest discounts
// TODO: Populate exact discount breaks and unit prices from Topaz Table 14
export const table14SupplierTerms = {
  source: 'Topaz-VBE Table 14',
  status: 'PENDING_VERIFICATION' as const,
  supplier0: {
    name: 'Local JIT Supplies',
    description: 'Local, just-in-time, zero warehouse storage overhead',
    basePricePerUnit: createConfigParam(12.50, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Unit base material cost', 'currency'),
    deliverySchedule: 'JIT_IMMEDIATE',
    minimumOrderQuantity: createConfigParam(0, 'Topaz Table 14', 'VERIFIED', 'No minimum order'),
    volumeDiscountTiers: []
  },
  supplier1: {
    name: 'Midland Industrial Materials',
    description: 'Regional supplier delivering in 3 equal batches across quarter',
    basePricePerUnit: createConfigParam(11.20, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Unit base material cost', 'currency'),
    deliverySchedule: '3_BATCHES',
    minimumOrderQuantity: createConfigParam(500, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Minimum order batch'),
    volumeDiscountTiers: [
      { threshold: 1000, discountPercent: 0.03 },
      { threshold: 2500, discountPercent: 0.06 }
    ]
  },
  supplier2: {
    name: 'Continental Bulk Polymers',
    description: 'Major national bulk supplier, 6 staggered shipments, requires storage',
    basePricePerUnit: createConfigParam(10.10, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Unit base material cost', 'currency'),
    deliverySchedule: '6_BATCHES',
    minimumOrderQuantity: createConfigParam(1500, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Minimum order units'),
    volumeDiscountTiers: [
      { threshold: 3000, discountPercent: 0.05 },
      { threshold: 6000, discountPercent: 0.10 }
    ]
  },
  supplier3: {
    name: 'Global Raw Commodities',
    description: '12 weekly contract deliveries, lowest unit cost, high order commitment',
    basePricePerUnit: createConfigParam(8.90, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Unit base material cost', 'currency'),
    deliverySchedule: '12_WEEKLY_DELIVERIES',
    minimumOrderQuantity: createConfigParam(3000, 'Topaz Table 14', 'PENDING_VERIFICATION', 'Minimum order units'),
    volumeDiscountTiers: [
      { threshold: 5000, discountPercent: 0.08 },
      { threshold: 10000, discountPercent: 0.14 }
    ]
  }
};

export const supplierTerms = table14SupplierTerms;

