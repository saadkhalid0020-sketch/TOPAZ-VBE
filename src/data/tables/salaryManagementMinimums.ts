import { createConfigParam } from '../../types/config';

// Table 17: Salary / Management Minimums
// Minimum management budget per department.
// Increasing management budget takes effect immediately; reducing requires 1-quarter notice.
// Salespeople: Base salary + commission on order value + quarterly expense allowance.
// Assembly: Hourly wage (increases take effect next quarter; cannot be reduced).
// Machinists: Automatically recruited (4 * machines * shifts).
// TODO: Populate exact baseline salary rates from Topaz Table 17
export const table17SalaryManagementMinimums = {
  source: 'Topaz-VBE Table 17',
  status: 'PENDING_VERIFICATION' as const,
  minimumManagementBudgetPerDept: createConfigParam(
    5000,
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Minimum quarterly budget requirement per executive department',
    'currency'
  ),
  salespersonBaseSalaryQuarterly: createConfigParam(
    4200,
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Standard quarterly base salary per salesperson',
    'currency'
  ),
  salespersonCommissionRate: createConfigParam(
    0.025, // 2.5% of order value
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Commission based on order value generated',
    'ratio'
  ),
  machinistQuarterlyWage: createConfigParam(
    5200,
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Standard quarterly wage per machinist technician',
    'currency'
  ),
  ancillaryWorkerQuarterlyWage: createConfigParam(
    3800,
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Standard quarterly wage per ancillary logistics/handling employee',
    'currency'
  ),
  assemblyBaseHourlyWage: createConfigParam(
    10.50,
    'Topaz Table 17',
    'PENDING_VERIFICATION',
    'Standard starting assembly hourly wage rate',
    'currency/hour'
  )
};

export const salaryManagementMinimums = table17SalaryManagementMinimums;

