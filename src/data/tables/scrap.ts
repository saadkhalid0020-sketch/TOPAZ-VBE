import { createConfigParam } from '../../types/config';

// Table 6: Scrap
// Rejected units during assembly and inspection are sold as scrap.
// If enough capacity exists, replacement units are produced automatically.
// TODO: Populate exact scrap recovery value percentages from Topaz Table 6
export const table06Scrap = {
  source: 'Topaz-VBE Table 6',
  status: 'PENDING_VERIFICATION' as const,
  product1ScrapRecoveryRate: createConfigParam(
    0.20,
    'Topaz Table 6',
    'PENDING_VERIFICATION',
    'Scrap salvage recovery value as % of standard material cost for Product 1'
  ),
  product2ScrapRecoveryRate: createConfigParam(
    0.20,
    'Topaz Table 6',
    'PENDING_VERIFICATION',
    'Scrap salvage recovery value as % of standard material cost for Product 2'
  ),
  product3ScrapRecoveryRate: createConfigParam(
    0.20,
    'Topaz Table 6',
    'PENDING_VERIFICATION',
    'Scrap salvage recovery value as % of standard material cost for Product 3'
  ),
  baseDefectRateStandardAssembly: createConfigParam(
    0.04,
    'Topaz Table 6',
    'PENDING_VERIFICATION',
    'Base defect rate at standard assembly duration'
  ),
  scrapPricePerUnit: {
    product1: createConfigParam(3.0, 'Topaz Table 6', 'PENDING_VERIFICATION', 'Scrap sale value per unit P1', 'currency'),
    product2: createConfigParam(4.5, 'Topaz Table 6', 'PENDING_VERIFICATION', 'Scrap sale value per unit P2', 'currency'),
    product3: createConfigParam(6.0, 'Topaz Table 6', 'PENDING_VERIFICATION', 'Scrap sale value per unit P3', 'currency')
  }
};

export const scrap = table06Scrap;

