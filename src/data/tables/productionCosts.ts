import { createConfigParam } from '../../types/config';

// Table 8: Production Costs
// Direct assembly, machining power/tooling, overheads per product.
// TODO: Populate exact production overhead rates from Topaz Table 8
export const table08ProductionCosts = {
  source: 'Topaz-VBE Table 8',
  status: 'PENDING_VERIFICATION' as const,
  machiningCostPerHour: createConfigParam(
    14.0,
    'Topaz Table 8',
    'PENDING_VERIFICATION',
    'Machining operating expense per hour (power, tooling, lubricants)',
    'currency'
  ),
  factoryOverheadQuarterlyFixed: createConfigParam(
    12500,
    'Topaz Table 8',
    'PENDING_VERIFICATION',
    'Fixed quarterly factory overhead cost (rates, lighting, heating)',
    'currency'
  )
};

export const productionCosts = table08ProductionCosts;

