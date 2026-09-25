import { QuarterlyDecisions } from '../types/decisions';
import { CompanyState } from '../types/company';

export interface ValidationIssue {
  field: string;
  category: 'marketing' | 'operations' | 'personnel' | 'finance' | 'research';
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateDecisions(
  decisions: QuarterlyDecisions,
  company: CompanyState,
  quarter: 1 | 2 | 3 | 4
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // 1. Marketing validation
  for (const prodId of ['product1', 'product2', 'product3'] as const) {
    const prices = decisions.marketing.prices[prodId];
    if (prices.homePrice < 0) {
      errors.push({
        field: `marketing.prices.${prodId}.homePrice`,
        category: 'marketing',
        type: 'error',
        message: `Home price for ${prodId} cannot be negative.`
      });
    }
    if (prices.exportPrice < 0) {
      errors.push({
        field: `marketing.prices.${prodId}.exportPrice`,
        category: 'marketing',
        type: 'error',
        message: `Export price for ${prodId} cannot be negative.`
      });
    }
    if (prices.homePrice > 0 && prices.homePrice < 15) {
      warnings.push({
        field: `marketing.prices.${prodId}.homePrice`,
        category: 'marketing',
        type: 'warning',
        message: `Home price for ${prodId} ($${prices.homePrice}) is very low and may sell below direct production cost.`
      });
    }

    const devBudget = decisions.marketing.developmentBudgets[prodId];
    if (devBudget < 0) {
      errors.push({
        field: `marketing.developmentBudgets.${prodId}`,
        category: 'marketing',
        type: 'error',
        message: `Development budget for ${prodId} cannot be negative.`
      });
    }
  }

  if (decisions.marketing.creditTermsDays < 0 || decisions.marketing.creditTermsDays > 120) {
    errors.push({
      field: 'marketing.creditTermsDays',
      category: 'marketing',
      type: 'error',
      message: 'Retailer credit terms must be between 0 and 120 days.'
    });
  }

  // 2. Personnel validation
  const totalSalespeoplePlanned =
    company.employees.salespeople +
    decisions.personnel.salespeopleHires -
    decisions.personnel.salespeopleDismissals;

  if (totalSalespeoplePlanned < 0) {
    errors.push({
      field: 'personnel.salespeopleHires',
      category: 'personnel',
      type: 'error',
      message: 'Salespeople dismissals cannot exceed existing sales force.'
    });
  }

  const allocatedSalespeople =
    decisions.personnel.salespeopleAllocation.south +
    decisions.personnel.salespeopleAllocation.west +
    decisions.personnel.salespeopleAllocation.north +
    decisions.personnel.salespeopleAllocation.export;

  if (allocatedSalespeople !== Math.max(0, totalSalespeoplePlanned)) {
    warnings.push({
      field: 'personnel.salespeopleAllocation',
      category: 'personnel',
      type: 'warning',
      message: `Total allocated salespeople (${allocatedSalespeople}) does not equal expected sales team (${Math.max(0, totalSalespeoplePlanned)}). The simulation will adjust proportionally.`
    });
  }

  if (decisions.personnel.assemblyHourlyWageOffer < company.employees.assemblyHourlyWage) {
    errors.push({
      field: 'personnel.assemblyHourlyWageOffer',
      category: 'personnel',
      type: 'error',
      message: `Assembly wages cannot be reduced below current rate ($${company.employees.assemblyHourlyWage.toFixed(2)}/hr).`
    });
  }

  // Management budgets minimum check ($5,000 per department)
  if (decisions.personnel.marketingManagementBudget < 5000) {
    warnings.push({
      field: 'personnel.marketingManagementBudget',
      category: 'personnel',
      type: 'warning',
      message: 'Marketing management budget is below standard recommended minimum ($5,000).'
    });
  }

  // 3. Operations validation
  if (decisions.operations.contractedMaintenanceHoursPerMachine < 0) {
    errors.push({
      field: 'operations.contractedMaintenanceHoursPerMachine',
      category: 'operations',
      type: 'error',
      message: 'Contracted maintenance hours cannot be negative.'
    });
  }

  // Negative delivery check: negative quantity transfers excess inventory.
  // Validation: cannot transfer more than currently available warehouse stock
  for (const prodId of ['product1', 'product2', 'product3'] as const) {
    for (const marketId of ['south', 'west', 'north', 'export'] as const) {
      const qty = decisions.operations.deliveryQuantities[prodId][marketId];
      if (qty < 0) {
        const warehouse = company.warehouses.find(w => w.marketId === marketId);
        const currentStock = warehouse?.stock[prodId] ?? 0;
        if (Math.abs(qty) > currentStock) {
          errors.push({
            field: `operations.deliveryQuantities.${prodId}.${marketId}`,
            category: 'operations',
            type: 'error',
            message: `Negative delivery of ${Math.abs(qty)} units of ${prodId} from ${marketId} exceeds available warehouse stock (${currentStock} units).`
          });
        }
      }
    }
  }

  // 4. Finance validation
  // Dividends only in Q1 or Q3
  if (decisions.finance.dividendPerShare > 0) {
    if (quarter !== 1 && quarter !== 3) {
      errors.push({
        field: 'finance.dividendPerShare',
        category: 'finance',
        type: 'error',
        message: 'Dividends can only be declared in Quarter 1 and Quarter 3.'
      });
    }
    if (company.finance.retainedEarnings <= 0) {
      warnings.push({
        field: 'finance.dividendPerShare',
        category: 'finance',
        type: 'warning',
        message: 'Declaring dividend with zero or negative retained earnings will deplete capital reserves.'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
