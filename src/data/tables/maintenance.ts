import { createConfigParam } from '../../types/config';

// Table 4: Maintenance
// Maintenance first repairs breakdowns; remainder is preventive.
// If contracted maintenance is insufficient, emergency repair hours charged at higher rate.
// TODO: Populate exact contracted and emergency hourly rates from Topaz Table 4
export const table04Maintenance = {
  source: 'Topaz-VBE Table 4',
  status: 'PENDING_VERIFICATION' as const,
  contractedHourCost: createConfigParam(
    35.0,
    'Topaz Table 4',
    'PENDING_VERIFICATION',
    'Contracted maintenance cost per hour per machine',
    'currency'
  ),
  emergencyBreakdownHourCost: createConfigParam(
    75.0,
    'Topaz Table 4',
    'PENDING_VERIFICATION',
    'Emergency breakdown repair hourly rate when contracted hours are exceeded',
    'currency'
  ),
  baseBreakdownHoursPerQuarter: createConfigParam(
    18.0,
    'Topaz Table 4',
    'PENDING_VERIFICATION',
    'Expected base breakdown hours per machine prior to preventive maintenance effects',
    'hours'
  ),
  preventiveMaintenanceEfficiencyMultiplier: createConfigParam(
    0.015,
    'Topaz Table 4',
    'PENDING_VERIFICATION',
    'Efficiency restoration per surplus preventive maintenance hour',
    'ratio'
  )
};

export const maintenance = table04Maintenance;

