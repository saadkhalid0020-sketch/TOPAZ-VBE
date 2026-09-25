import { createConfigParam } from '../../types/config';

// Table 19: Overdraft
// Overdraft limit, machine supplier creditworthiness check.
// Creditworthiness: Overdraft Limit - Current Overdraft - Unsecured Loans - Outstanding Machine Payments.
// Determines how many machines can be ordered.
export const table19Overdraft = {
  source: 'Topaz-VBE Table 19',
  status: 'PENDING_VERIFICATION' as const,
  baseOverdraftLimit: createConfigParam(
    75000,
    'Topaz Table 19',
    'PENDING_VERIFICATION',
    'Standard negotiated bank overdraft line of credit',
    'currency'
  ),
  overdraftLimitNetWorthMultiplier: createConfigParam(
    0.20,
    'Topaz Table 19',
    'PENDING_VERIFICATION',
    'Additional overdraft borrowing room granted per dollar of net worth above baseline'
  )
};

export const overdraft = table19Overdraft;

