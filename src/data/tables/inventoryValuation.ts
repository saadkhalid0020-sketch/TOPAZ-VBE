import { createConfigParam } from '../../types/config';

// Table 21: Inventory Valuation
// Cost of goods sold and closing stock valuation conventions (standard absorption vs FIFO/Weighted Average).
// Topaz values finished goods at standard manufacturing cost and raw materials at moving weighted average cost.
export const table21InventoryValuation = {
  source: 'Topaz-VBE Table 21',
  status: 'PENDING_VERIFICATION' as const,
  valuationMethod: createConfigParam(
    'STANDARD_ABSORPTION_COST',
    'Topaz Table 21',
    'VERIFIED',
    'Valuation method for finished goods inventory'
  ),
  standardProductUnitCosts: {
    product1: createConfigParam(24.50, 'Topaz Table 21', 'PENDING_VERIFICATION', 'Standard unit manufacturing cost P1', 'currency'),
    product2: createConfigParam(36.00, 'Topaz Table 21', 'PENDING_VERIFICATION', 'Standard unit manufacturing cost P2', 'currency'),
    product3: createConfigParam(52.00, 'Topaz Table 21', 'PENDING_VERIFICATION', 'Standard unit manufacturing cost P3', 'currency')
  }
};

export const inventoryValuation = table21InventoryValuation;

