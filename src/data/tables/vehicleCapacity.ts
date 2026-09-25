import { createConfigParam } from '../../types/config';

// Table 9: Vehicle Capacity
// Finished product unit capacity per company-owned vehicle and hired lorry.
// TODO: Populate exact vehicle payload capacities from Topaz Table 9
export const table09VehicleCapacity = {
  source: 'Topaz-VBE Table 9',
  status: 'PENDING_VERIFICATION' as const,
  ownedVehicleCapacityUnits: createConfigParam(
    1200,
    'Topaz Table 9',
    'PENDING_VERIFICATION',
    'Maximum units transport capacity per company-owned vehicle per quarter'
  ),
  hiredLorryCapacityUnits: createConfigParam(
    600,
    'Topaz Table 9',
    'PENDING_VERIFICATION',
    'Capacity per hired transport vehicle dispatch'
  ),
  maxTripsPerOwnedVehiclePerQuarter: createConfigParam(
    12,
    'Topaz Table 9',
    'PENDING_VERIFICATION',
    'Maximum delivery round-trips achievable per quarter by one owned vehicle'
  )
};

export const vehicleCapacity = table09VehicleCapacity;

