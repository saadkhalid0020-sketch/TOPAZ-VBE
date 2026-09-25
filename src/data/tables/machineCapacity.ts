import { createConfigParam } from '../../types/config';

// Table 5: Machine Capacity
// Each machine requires 4 machinists per shift.
// TODO: Populate exact operating hours per shift from Topaz Table 5
export const table05MachineCapacity = {
  source: 'Topaz-VBE Table 5',
  status: 'PENDING_VERIFICATION' as const,
  machinistsPerMachinePerShift: createConfigParam(
    4,
    'Topaz Rule / Table 5',
    'VERIFIED',
    'Machinists required per machine per operational shift'
  ),
  hoursPerShiftPerQuarter: createConfigParam(
    500, // 500 hours/quarter per shift
    'Topaz Table 5',
    'PENDING_VERIFICATION',
    'Standard operating hours per machine per shift per quarter',
    'hours'
  ),
  maxShifts: createConfigParam(
    3,
    'Topaz Rule / Table 5',
    'VERIFIED',
    'Maximum allowed shifts in factory'
  ),
  baseEfficiencyDegradationPerQuarter: createConfigParam(
    0.02,
    'Topaz Table 5',
    'PENDING_VERIFICATION',
    'Natural quarterly loss in machine efficiency without maintenance',
    'ratio'
  )
};

export const machineCapacity = table05MachineCapacity;

