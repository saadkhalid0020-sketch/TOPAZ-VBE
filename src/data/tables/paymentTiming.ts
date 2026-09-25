import { createConfigParam } from '../../types/config';

// Table 22: Payment Timing
// Creditor payment timing conventions.
// Purchases create liabilities according to the payment schedule.
// Dividends: Declared in Q1 or Q3, paid at the beginning of the following quarter.
// Tax: Assessed Q4, paid Q2 following year.
export const table22PaymentTiming = {
  source: 'Topaz-VBE Table 22',
  status: 'PENDING_VERIFICATION' as const,
  supplierPaymentDaysAverage: createConfigParam(
    45,
    'Topaz Table 22',
    'PENDING_VERIFICATION',
    'Average supplier payment credit period in days',
    'days'
  ),
  quarterlyCreditorsCarryoverRatio: createConfigParam(
    0.50, // Approx 45 days of 90-day quarter
    'Topaz Table 22',
    'PENDING_VERIFICATION',
    'Proportion of quarter raw material orders unpaid at quarter-end',
    'ratio'
  )
};

export const paymentTiming = table22PaymentTiming;

