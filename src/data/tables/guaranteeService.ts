import { createConfigParam } from '../../types/config';

// Table 7: Guarantee Service
// One-year guarantee creates servicing costs on returned defective products.
// Return rates depend inversely on product quality.
// TODO: Populate exact guarantee return rate curve from Topaz Table 7
export const table07GuaranteeService = {
  source: 'Topaz-VBE Table 7',
  status: 'PENDING_VERIFICATION' as const,
  baseReturnRate: createConfigParam(
    0.035,
    'Topaz Table 7',
    'PENDING_VERIFICATION',
    'Base guarantee return rate per year for standard quality products'
  ),
  serviceCostPerUnit: {
    product1: createConfigParam(12.0, 'Topaz Table 7', 'PENDING_VERIFICATION', 'Guarantee repair cost P1', 'currency'),
    product2: createConfigParam(18.0, 'Topaz Table 7', 'PENDING_VERIFICATION', 'Guarantee repair cost P2', 'currency'),
    product3: createConfigParam(28.0, 'Topaz Table 7', 'PENDING_VERIFICATION', 'Guarantee repair cost P3', 'currency')
  }
};

export const guaranteeService = table07GuaranteeService;

