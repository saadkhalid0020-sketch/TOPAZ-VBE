import { createConfigParam } from '../../types/config';

// Table 23: Credit Terms
// Company decides how many days retailers have to pay (30 days is normal).
// Longer credit increases retailer attractiveness; shorter reduces it.
// Interacts with Central Bank interest rate.
// Unpaid customer invoices become debtors with imperfect collection timing.
export const table23CreditTerms = {
  source: 'Topaz-VBE Table 23',
  status: 'PENDING_VERIFICATION' as const,
  normalCreditDays: createConfigParam(
    30,
    'Topaz Rule / Table 23',
    'VERIFIED',
    'Benchmark standard credit period offered to commercial retailers',
    'days'
  ),
  attractionSensitivityPer10Days: createConfigParam(
    0.035,
    'Topaz Table 23',
    'PENDING_VERIFICATION',
    'Demand shift percentage per 10 days variation from 30-day baseline'
  ),
  badDebtProvisionRate: createConfigParam(
    0.005, // 0.5% default provision
    'Topaz Table 23',
    'PENDING_VERIFICATION',
    'Quarterly bad debt write-off rate on trade debtors',
    'ratio'
  ),
  quarterEndDebtorCollectionRate: createConfigParam(
    0.70, // 70% collected within quarter, 30% carried into accounts receivable
    'Topaz Table 23',
    'PENDING_VERIFICATION',
    'Standard cash collection ratio of invoiced sales during the quarter',
    'ratio'
  )
};

export const creditTerms = table23CreditTerms;

