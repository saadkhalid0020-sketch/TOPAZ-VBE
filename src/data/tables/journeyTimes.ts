import { createConfigParam } from '../../types/config';

// Table 10: Journey Times
// Regional delivery turnaround times from South factory.
// TODO: Populate exact journey transit hours from Topaz Table 10
export const table10JourneyTimes = {
  source: 'Topaz-VBE Table 10',
  status: 'PENDING_VERIFICATION' as const,
  southDays: createConfigParam(
    0.5,
    'Topaz Table 10',
    'PENDING_VERIFICATION',
    'Local factory area transit time (South) in days'
  ),
  westDays: createConfigParam(
    1.5,
    'Topaz Table 10',
    'PENDING_VERIFICATION',
    'Transit time to West regional warehouse in days'
  ),
  northDays: createConfigParam(
    2.5,
    'Topaz Table 10',
    'PENDING_VERIFICATION',
    'Transit time to North regional warehouse in days'
  ),
  exportDays: createConfigParam(
    4.0,
    'Topaz Table 10',
    'PENDING_VERIFICATION',
    'Transit time to Export port and handling in days'
  )
};

export const journeyTimes = table10JourneyTimes;

