import { createConfigParam } from '../../types/config';

// Table 13: Average Stock Calculations
// Conventions for computing quarterly average stock for warehousing and inventory carrying charges.
// Standard Topaz formula: Average Stock = (Opening Stock + Closing Stock) / 2
// or (Opening Stock + Deliveries - Sales/2) depending on timing rule.
export const table13AverageStockCalculations = {
  source: 'Topaz-VBE Table 13',
  status: 'PENDING_VERIFICATION' as const,
  calculationMethod: createConfigParam(
    'OPENING_CLOSING_MEAN',
    'Topaz Table 13',
    'VERIFIED',
    'Average stock = (Opening Stock + Closing Stock) / 2'
  ),
  inventoryHoldingCostAnnualPercent: createConfigParam(
    0.12, // 3% quarterly
    'Topaz Table 13',
    'PENDING_VERIFICATION',
    'Annual holding cost interest rate on inventory investment'
  )
};

export const averageStockCalculations = table13AverageStockCalculations;

