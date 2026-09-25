import { createConfigParam } from '../../types/config';

// Table 18: Machines / Vehicles
// Property: fixed value, no depreciation.
// Machines: 2.5% quarterly decreasing-balance depreciation.
// Vehicles: 6.25% quarterly decreasing-balance depreciation.
// Machine pipeline:
//   Quarter T: Order
//   Quarter T+1: First 50% payment
//   Quarter T+2: Installation, second 50% payment
//   Quarter T+3: Operational
// Vehicles: Purchased in Quarter T become available beginning of Quarter T+1.
export const table18MachinesVehicles = {
  source: 'Topaz-VBE Table 18',
  status: 'PENDING_VERIFICATION' as const,
  machineCostNew: createConfigParam(
    50000,
    'Topaz Table 18',
    'PENDING_VERIFICATION',
    'Capital acquisition cost per new industrial machine',
    'currency'
  ),
  vehicleCostNew: createConfigParam(
    24000,
    'Topaz Table 18',
    'PENDING_VERIFICATION',
    'Capital acquisition cost per new distribution vehicle',
    'currency'
  ),
  machineQuarterlyDepreciationRate: createConfigParam(
    0.025, // 2.5%
    'Topaz Rule / Table 18',
    'VERIFIED',
    'Decreasing-balance quarterly depreciation rate for machines (2.5%)',
    'ratio'
  ),
  vehicleQuarterlyDepreciationRate: createConfigParam(
    0.0625, // 6.25%
    'Topaz Rule / Table 18',
    'VERIFIED',
    'Decreasing-balance quarterly depreciation rate for vehicles (6.25%)',
    'ratio'
  ),
  machineMaxAgeQuarters: createConfigParam(
    40,
    'Topaz Table 18',
    'PENDING_VERIFICATION',
    'Expected economic lifecycle in quarters for production machinery'
  ),
  scrapSaleDiscountOnBookValue: createConfigParam(
    0.85,
    'Topaz Table 18',
    'PENDING_VERIFICATION',
    'Realized percentage of net book value upon voluntary asset disposal'
  )
};

export const machinesVehicles = table18MachinesVehicles;

