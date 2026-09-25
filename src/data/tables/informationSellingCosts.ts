import { createConfigParam } from '../../types/config';

// Table 2: Information / Selling Costs
// Selling-office overhead is 1% of order value according to provided rules.
// TODO: Populate exact competitor intelligence costs and sales expense allowances from Topaz Table 2
export const table02InformationSellingCosts = {
  source: 'Topaz-VBE Table 2',
  status: 'PENDING_VERIFICATION' as const,
  sellingOfficeOverheadRate: createConfigParam(
    0.01,
    'Topaz Rule / Table 2',
    'VERIFIED',
    'Selling-office overhead is 1% of total order value',
    'ratio'
  ),
  salespersonQuarterlyAllowance: createConfigParam(
    1500,
    'Topaz Table 2',
    'PENDING_VERIFICATION',
    'Quarterly expense allowance per active salesperson',
    'currency'
  ),
  intelAdSpendCost: createConfigParam(
    2500,
    'Topaz Table 2',
    'PENDING_VERIFICATION',
    'Cost to purchase competitor advertising expenditure intelligence',
    'currency'
  ),
  intelDevSpendCost: createConfigParam(
    2500,
    'Topaz Table 2',
    'PENDING_VERIFICATION',
    'Cost to purchase competitor R&D expenditure intelligence',
    'currency'
  ),
  intelDesignRatingsCost: createConfigParam(
    2000,
    'Topaz Table 2',
    'PENDING_VERIFICATION',
    'Cost to purchase competitor product design rating intelligence',
    'currency'
  ),
  intelMarketShareCost: createConfigParam(
    3000,
    'Topaz Table 2',
    'PENDING_VERIFICATION',
    'Cost to purchase competitor regional market share intelligence',
    'currency'
  )
};

export const informationSellingCosts = table02InformationSellingCosts;

