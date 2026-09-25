import { createConfigParam } from '../../types/config';

// Table 20: Interest / Tax
// Excess cash earns deposit interest = Central Bank Rate - 2 percentage points.
// Overdraft interest = Central Bank Rate + 4 percentage points.
// Unsecured borrowing = Central Bank Rate + 10 percentage points.
// Tax is charged on taxable profit; losses accumulate and offset future taxable profits.
// Tax is assessed at end of Q4; paid automatically in Q2 of following year.
// Corporate tax rate: 30% baseline.
export const table20InterestTax = {
  source: 'Topaz-VBE Table 20',
  status: 'VERIFIED' as const,
  depositRateSpread: createConfigParam(
    -0.02, // CBR - 2%
    'Topaz Rule / Table 20',
    'VERIFIED',
    'Deposit interest rate spread relative to Central Bank Rate (CBR - 2%)',
    'ratio'
  ),
  overdraftRateSpread: createConfigParam(
    0.04, // CBR + 4%
    'Topaz Rule / Table 20',
    'VERIFIED',
    'Overdraft interest rate spread relative to Central Bank Rate (CBR + 4%)',
    'ratio'
  ),
  unsecuredLoanRateSpread: createConfigParam(
    0.10, // CBR + 10%
    'Topaz Rule / Table 20',
    'VERIFIED',
    'Unsecured emergency borrowing rate spread relative to Central Bank Rate (CBR + 10%)',
    'ratio'
  ),
  corporateTaxRate: createConfigParam(
    0.30, // 30%
    'Topaz Table 20',
    'PENDING_VERIFICATION',
    'Corporate income tax rate on taxable profit',
    'ratio'
  )
};

export const interestTax = table20InterestTax;

