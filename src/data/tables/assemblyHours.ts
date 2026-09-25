import { createConfigParam } from '../../types/config';

// Table 16: Assembly Hours
// Assembly workers operate one day shift.
// Player can choose a longer assembly time: improves quality, reduces defects, reduces capacity.
// TODO: Populate exact assembly quality tradeoff curve parameters from Topaz Table 16
export const table16AssemblyHours = {
  source: 'Topaz-VBE Table 16',
  status: 'PENDING_VERIFICATION' as const,
  standardQuarterlyHoursPerWorker: createConfigParam(
    480, // e.g. 40 hours/week * 12 weeks
    'Topaz Table 16',
    'PENDING_VERIFICATION',
    'Standard productive hours available per assembly worker per quarter',
    'hours'
  ),
  overtimeLimitHoursPerWorker: createConfigParam(
    60,
    'Topaz Table 16',
    'PENDING_VERIFICATION',
    'Maximum allowed overtime hours per worker per quarter',
    'hours'
  ),
  overtimeWageMultiplier: createConfigParam(
    1.50,
    'Topaz Table 16',
    'PENDING_VERIFICATION',
    'Overtime wage rate multiplier (time-and-a-half)',
    'ratio'
  ),
  qualityBoostPerExtraMinute: createConfigParam(
    0.004,
    'Topaz Table 16',
    'PENDING_VERIFICATION',
    'Product quality score increase per minute added above standard assembly time',
    'points/min'
  ),
  defectReductionPerExtraMinute: createConfigParam(
    0.0015,
    'Topaz Table 16',
    'PENDING_VERIFICATION',
    'Defect rate decrease per minute added above standard assembly time',
    'ratio/min'
  )
};

export const assemblyHours = table16AssemblyHours;

