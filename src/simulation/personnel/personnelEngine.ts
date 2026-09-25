import { EmployeeState } from '../../types/personnel';
import { MarketId, EconomyState } from '../../types/market';
import { PersonnelDecisions } from '../../types/decisions';
import { table15Training } from '../../data/tables/training';
import { table16AssemblyHours } from '../../data/tables/assemblyHours';
import { table17SalaryManagementMinimums } from '../../data/tables/salaryManagementMinimums';
import { SeededRNG } from '../../utils/random';
import { clamp } from '../../utils/math';

export interface PersonnelExecutionResult {
  updatedEmployees: EmployeeState;
  salesSalariesTotal: number;
  salesExpensesTotal: number;
  machinistsWagesTotal: number;
  assemblyWagesTotal: number;
  ancillaryWagesTotal: number;
  recruitmentAndTrainingCostsTotal: number;
  dismissalCompensationTotal: number;
  managementBudgetTotal: number;
  salesRecruitedCount: number;
  salesTurnoverCount: number;
  assemblyRecruitedCount: number;
  assemblyTurnoverCount: number;
}

export function executePersonnel(
  current: EmployeeState,
  decisions: PersonnelDecisions,
  activeMachinesCount: number,
  shiftLevel: number,
  economy: EconomyState,
  rng: SeededRNG
): PersonnelExecutionResult {
  // 1. Machinists: Automatically recruited to satisfy formula: 4 * machines * shifts
  const requiredMachinists = 4 * activeMachinesCount * shiftLevel;
  const machinistsQuarterlyWage = table17SalaryManagementMinimums.machinistQuarterlyWage.value;
  const machinistsWagesTotal = requiredMachinists * machinistsQuarterlyWage;

  // 2. Sales Force recruitment, dismissal, training
  let salesRecruitedCount = 0;
  let recruitmentAndTrainingCosts = 0;
  let dismissalCompensation = 0;

  // Sales training: guaranteed conversion
  const salesTrained = Math.max(0, decisions.salespeopleToTrain);
  if (salesTrained > 0) {
    salesRecruitedCount += salesTrained;
    recruitmentAndTrainingCosts += salesTrained * table15Training.salesTrainingCost.value;
  }

  // Direct sales recruitment: probabilistic based on unemployment & personnel budget
  const salesHiresRequested = Math.max(0, decisions.salespeopleHires);
  if (salesHiresRequested > 0) {
    const successRate = clamp(0.70 + economy.unemploymentRate * 2.0 + (decisions.personnelManagementBudget / 20000) * 0.15, 0.40, 1.0);
    for (let i = 0; i < salesHiresRequested; i++) {
      if (rng.chance(successRate)) {
        salesRecruitedCount++;
      }
    }
    recruitmentAndTrainingCosts += salesHiresRequested * table15Training.salesRecruitmentFee.value;
  }

  // Sales dismissals
  const salesDismissed = Math.min(current.salespeople, Math.max(0, decisions.salespeopleDismissals));
  if (salesDismissed > 0) {
    dismissalCompensation += salesDismissed * table15Training.dismissalCompensationPerEmployee.value;
  }

  // Sales turnover (departures occur at quarter end)
  // Protected salespeople who were recently trained cannot leave
  const protectedSalespeople = current.salespeopleTrainedRemainingCommitment;
  const turnoverEligible = Math.max(0, current.salespeople - protectedSalespeople);
  const baseSalesTurnoverRate = 0.04;
  let salesTurnoverCount = 0;

  for (let i = 0; i < turnoverEligible; i++) {
    if (rng.chance(baseSalesTurnoverRate)) {
      salesTurnoverCount++;
    }
  }

  const nextTotalSalespeople = Math.max(0, current.salespeople + salesRecruitedCount - salesDismissed - salesTurnoverCount);

  // Sales allocation reconciliation
  const allocated = decisions.salespeopleAllocation;
  let totalAllocated = allocated.south + allocated.west + allocated.north + allocated.export;
  let nextAllocation: Record<MarketId, number> = { ...allocated };

  if (totalAllocated !== nextTotalSalespeople) {
    // Proportional redistribution
    const ratio = nextTotalSalespeople > 0 && totalAllocated > 0 ? nextTotalSalespeople / totalAllocated : 0;
    nextAllocation = {
      south: Math.round(allocated.south * ratio),
      west: Math.round(allocated.west * ratio),
      north: Math.round(allocated.north * ratio),
      export: Math.max(0, nextTotalSalespeople - (Math.round(allocated.south * ratio) + Math.round(allocated.west * ratio) + Math.round(allocated.north * ratio))),
    };
  }

  // Sales compensation
  const salesBaseSalary = current.salespersonBaseSalary;
  const salesSalariesTotal = nextTotalSalespeople * salesBaseSalary;
  const salesExpensesTotal = nextTotalSalespeople * current.salespersonQuarterlyExpenses;

  // 3. Assembly Workers recruitment, dismissal, training
  let assemblyRecruitedCount = 0;
  const assemblyTrained = Math.max(0, decisions.assemblyToTrain);
  if (assemblyTrained > 0) {
    assemblyRecruitedCount += assemblyTrained;
    recruitmentAndTrainingCosts += assemblyTrained * table15Training.assemblyTrainingCost.value;
  }

  const assemblyHiresRequested = Math.max(0, decisions.assemblyHires);
  if (assemblyHiresRequested > 0) {
    const successRate = clamp(0.75 + economy.unemploymentRate * 2.5 + (decisions.personnelManagementBudget / 20000) * 0.15, 0.50, 1.0);
    for (let i = 0; i < assemblyHiresRequested; i++) {
      if (rng.chance(successRate)) {
        assemblyRecruitedCount++;
      }
    }
    recruitmentAndTrainingCosts += assemblyHiresRequested * table15Training.assemblyRecruitmentFee.value;
  }

  const assemblyDismissed = Math.min(current.assemblyWorkers, Math.max(0, decisions.assemblyDismissals));
  if (assemblyDismissed > 0) {
    dismissalCompensation += assemblyDismissed * table15Training.dismissalCompensationPerEmployee.value;
  }

  // Assembly turnover
  const baseAssemblyTurnoverRate = 0.05;
  let assemblyTurnoverCount = 0;
  for (let i = 0; i < current.assemblyWorkers; i++) {
    if (rng.chance(baseAssemblyTurnoverRate)) {
      assemblyTurnoverCount++;
    }
  }

  const nextAssemblyWorkers = Math.max(1, current.assemblyWorkers + assemblyRecruitedCount - assemblyDismissed - assemblyTurnoverCount);

  // Wage rule: Wage increases take effect next quarter. Wages cannot be reduced.
  // Effective wage this quarter was set in previous quarter
  const effectiveAssemblyWage = current.assemblyNextQuarterHourlyWage || current.assemblyHourlyWage;
  const offeredNextWage = Math.max(effectiveAssemblyWage, decisions.assemblyHourlyWageOffer);

  const hoursPerWorker = table16AssemblyHours.standardQuarterlyHoursPerWorker.value;
  const assemblyWagesTotal = nextAssemblyWorkers * hoursPerWorker * effectiveAssemblyWage;

  // 4. Ancillary Workers
  const ancillaryWorkersCount = current.ancillaryWorkers || 4;
  const ancillaryWagesTotal = ancillaryWorkersCount * table17SalaryManagementMinimums.ancillaryWorkerQuarterlyWage.value;

  // 5. Management Budgets (minimum $5,000/dept; reductions take 1-quarter notice)
  const minBudget = table17SalaryManagementMinimums.minimumManagementBudgetPerDept.value;
  const mktBudget = Math.max(minBudget, decisions.marketingManagementBudget);
  const prodBudget = Math.max(minBudget, decisions.productionManagementBudget);
  const persBudget = Math.max(minBudget, decisions.personnelManagementBudget);
  const finBudget = Math.max(minBudget, decisions.financialManagementBudget);
  const managementBudgetTotal = mktBudget + prodBudget + persBudget + finBudget;

  const updatedEmployees: EmployeeState = {
    salespeople: nextTotalSalespeople,
    salespeopleAllocation: nextAllocation,
    salespeopleTrainedRemainingCommitment: salesTrained > 0 ? salesTrained : 0,
    machinists: requiredMachinists,
    assemblyWorkers: nextAssemblyWorkers,
    assemblyWorkersInTraining: 0,
    ancillaryWorkers: ancillaryWorkersCount,
    salespersonBaseSalary: salesBaseSalary,
    salespersonCommissionRate: current.salespersonCommissionRate,
    salespersonQuarterlyExpenses: current.salespersonQuarterlyExpenses,
    assemblyHourlyWage: effectiveAssemblyWage,
    assemblyNextQuarterHourlyWage: offeredNextWage,
    marketingManagementBudget: mktBudget,
    productionManagementBudget: prodBudget,
    personnelManagementBudget: persBudget,
    financialManagementBudget: finBudget,
    pendingBudgetReductions: {},
    salespeopleLeftLastQuarter: salesTurnoverCount,
    assemblyWorkersLeftLastQuarter: assemblyTurnoverCount,
  };

  return {
    updatedEmployees,
    salesSalariesTotal,
    salesExpensesTotal,
    machinistsWagesTotal,
    assemblyWagesTotal,
    ancillaryWagesTotal,
    recruitmentAndTrainingCostsTotal: recruitmentAndTrainingCosts,
    dismissalCompensationTotal: dismissalCompensation,
    managementBudgetTotal,
    salesRecruitedCount,
    salesTurnoverCount,
    assemblyRecruitedCount,
    assemblyTurnoverCount,
  };
}
