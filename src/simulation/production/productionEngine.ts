import { ProductId } from '../../types/product';
import { CompanyState } from '../../types/company';
import { OperationsDecisions } from '../../types/decisions';
import { ProductionCapacityInfo, MachineState } from '../../types/production';
import { table03ManufacturingRequirements } from '../../data/tables/manufacturingRequirements';
import { table04Maintenance } from '../../data/tables/maintenance';
import { table05MachineCapacity } from '../../data/tables/machineCapacity';
import { table06Scrap } from '../../data/tables/scrap';
import { table07GuaranteeService } from '../../data/tables/guaranteeService';
import { table16AssemblyHours } from '../../data/tables/assemblyHours';
import { table18MachinesVehicles } from '../../data/tables/machinesVehicles';
import { SeededRNG } from '../../utils/random';
import { clamp, safeDivide } from '../../utils/math';

export interface ProductionExecutionResult {
  capacityInfo: ProductionCapacityInfo;
  updatedMachines: MachineState[];
  updatedMaterialsInventory: number;
  machiningCostTotal: number;
  maintenanceCostTotal: number;
  scrapIncomeTotal: number;
  guaranteeServicingCostTotal: number;
  guaranteeReturns: Record<ProductId, number>;
  contractedMaintenanceHours: number;
  emergencyRepairHours: number;
  totalBreakdownHours: number;
}

export function executeProduction(
  company: CompanyState,
  decisions: OperationsDecisions,
  rng: SeededRNG
): ProductionExecutionResult {
  const products: ProductId[] = ['product1', 'product2', 'product3'];

  // 1. Calculate requested production from delivery schedule
  // Delivery schedule is per product across 4 markets
  const requestedUnits: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
  let totalRequestedUnits = 0;

  for (const prodId of products) {
    let prodReq = 0;
    for (const mkt of ['south', 'west', 'north', 'export'] as const) {
      const scheduledDelivery = decisions.deliveryQuantities[prodId]?.[mkt] || 0;
      // Positive scheduled deliveries require production or existing stock
      if (scheduledDelivery > 0) {
        prodReq += scheduledDelivery;
      }
    }
    // Net requested after available central inventory
    const centralStock = company.products.find(p => p.id === prodId)?.inventory || 0;
    const needed = Math.max(0, prodReq - centralStock);
    requestedUnits[prodId] = needed;
    totalRequestedUnits += needed;
  }

  // 2. Machine maintenance, breakdown, and capacity
  const machineCount = company.machines.length;
  const shifts = decisions.shifts || 1;
  const contractedHoursPerMachine = Math.max(0, decisions.contractedMaintenanceHoursPerMachine || 0);
  const totalContractedHours = contractedHoursPerMachine * machineCount;

  let totalBreakdownHours = 0;
  let totalEmergencyRepairHours = 0;
  let totalPreventiveHours = 0;

  const updatedMachines: MachineState[] = company.machines.map(m => {
    // Breakdown calculation based on age and previous maintenance
    const agePenalty = (m.ageQuarters / 10) * 2.0;
    const baseBreakdown = table04Maintenance.baseBreakdownHoursPerQuarter.value;
    const breakdownNoise = rng.nextGaussian(0, 2.0);
    const breakdownHours = Math.max(0, Math.round(baseBreakdown + agePenalty - m.preventiveMaintenanceHours * 0.15 + breakdownNoise));

    totalBreakdownHours += breakdownHours;

    // Maintenance allocation: repairs breakdowns first, remainder is preventive
    let emergencyHours = 0;
    let preventiveHours = 0;

    if (contractedHoursPerMachine >= breakdownHours) {
      preventiveHours = contractedHoursPerMachine - breakdownHours;
    } else {
      emergencyHours = breakdownHours - contractedHoursPerMachine;
    }

    totalEmergencyRepairHours += emergencyHours;
    totalPreventiveHours += preventiveHours;

    // Efficiency evolution
    const degradation = table05MachineCapacity.baseEfficiencyDegradationPerQuarter.value;
    const efficiencyRestoration = preventiveHours * table04Maintenance.preventiveMaintenanceEfficiencyMultiplier.value;
    const nextEfficiency = clamp(m.efficiency - degradation + efficiencyRestoration, 0.70, 1.0);

    // Machine depreciation: 2.5% decreasing-balance
    const nextBookValue = m.bookValue * (1 - table18MachinesVehicles.machineQuarterlyDepreciationRate.value);

    return {
      id: m.id,
      ageQuarters: m.ageQuarters + 1,
      efficiency: nextEfficiency,
      breakdownHoursLastQuarter: breakdownHours,
      preventiveMaintenanceHours: preventiveHours,
      bookValue: nextBookValue,
    };
  });

  // Calculate machine capacity in equivalent standard machine hours
  const hoursPerShift = table05MachineCapacity.hoursPerShiftPerQuarter.value;
  let totalAvailableMachineHours = 0;

  for (let i = 0; i < updatedMachines.length; i++) {
    const m = updatedMachines[i];
    const netOperatingHours = Math.max(0, hoursPerShift * shifts - m.breakdownHoursLastQuarter);
    totalAvailableMachineHours += netOperatingHours * m.efficiency;
  }

  // Convert machine hours to equivalent finished product units capacity
  // Weighted average machining time ~0.70 hrs/unit
  const machineCapacityUnits = Math.round(totalAvailableMachineHours / 0.70);

  // 3. Assembly capacity
  // Assembly workers operate one day shift (480 hours/quarter)
  const assemblyWorkers = company.employees.assemblyWorkers;
  const hoursPerWorker = table16AssemblyHours.standardQuarterlyHoursPerWorker.value;
  const totalAssemblyMinutes = assemblyWorkers * hoursPerWorker * 60;

  // Actual assembly times chosen
  const assemblyMinutesChosen: Record<ProductId, number> = {
    product1: Math.max(table03ManufacturingRequirements.product1.standardAssemblyMinutes.value, decisions.assemblyTimeMinutes.product1 || 45),
    product2: Math.max(table03ManufacturingRequirements.product2.standardAssemblyMinutes.value, decisions.assemblyTimeMinutes.product2 || 60),
    product3: Math.max(table03ManufacturingRequirements.product3.standardAssemblyMinutes.value, decisions.assemblyTimeMinutes.product3 || 90),
  };

  // Average assembly minutes per unit
  const avgAssemblyMinutes = (assemblyMinutesChosen.product1 + assemblyMinutesChosen.product2 + assemblyMinutesChosen.product3) / 3;
  const assemblyCapacityUnits = Math.round(totalAssemblyMinutes / avgAssemblyMinutes);

  // 4. Effective capacity = min(machine capacity, assembly capacity)
  const limitingFactor =
    machineCapacityUnits < assemblyCapacityUnits
      ? 'machining'
      : assemblyCapacityUnits < machineCapacityUnits
      ? 'assembly'
      : 'balanced';

  const effectiveCapacityUnits = Math.min(machineCapacityUnits, assemblyCapacityUnits);

  // 5. Check if production is restricted
  const isRestricted = totalRequestedUnits > effectiveCapacityUnits;
  const capacityScalingRatio = isRestricted ? safeDivide(effectiveCapacityUnits, totalRequestedUnits, 1.0) : 1.0;

  const actualProductionUnits: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
  const rejectedUnits: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
  let scrapIncomeTotal = 0;
  let totalMaterialsConsumed = 0;

  for (const prodId of products) {
    const rawPlanned = Math.round(requestedUnits[prodId] * capacityScalingRatio);

    // Defect & scrap calculation based on assembly time chosen
    const stdTime = table03ManufacturingRequirements[prodId].standardAssemblyMinutes.value;
    const chosenTime = assemblyMinutesChosen[prodId];
    const extraMinutes = Math.max(0, chosenTime - stdTime);

    const baseDefect = table06Scrap.baseDefectRateStandardAssembly.value;
    const defectReduction = extraMinutes * table16AssemblyHours.defectReductionPerExtraMinute.value;
    const actualDefectRate = clamp(baseDefect - defectReduction, 0.01, 0.10);

    const rejected = Math.round(rawPlanned * actualDefectRate);
    const netGoodUnits = Math.max(0, rawPlanned - rejected);

    actualProductionUnits[prodId] = netGoodUnits;
    rejectedUnits[prodId] = rejected;

    // Scrap sales revenue
    const scrapPrice = table06Scrap.scrapPricePerUnit[prodId].value;
    scrapIncomeTotal += rejected * scrapPrice;

    // Material consumption
    const matUnitsPerProd = table03ManufacturingRequirements[prodId].basicMaterialUnits.value;
    totalMaterialsConsumed += rawPlanned * matUnitsPerProd;
  }

  // 6. Guarantee return calculation
  const guaranteeReturns: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
  let guaranteeServicingCostTotal = 0;

  for (const prodId of products) {
    const prod = company.products.find(p => p.id === prodId);
    const quality = prod?.quality || 60;
    const baseReturnRate = table07GuaranteeService.baseReturnRate.value;
    const returnRate = clamp(baseReturnRate * (1 - (quality - 50) * 0.01), 0.01, 0.08);

    const pastCumulativeSales = prod?.cumulativeSales || 2000;
    const returns = Math.round(pastCumulativeSales * returnRate * 0.25); // Quarterly guarantee returns
    guaranteeReturns[prodId] = returns;

    const serviceCostPerUnit = table07GuaranteeService.serviceCostPerUnit[prodId].value;
    guaranteeServicingCostTotal += returns * serviceCostPerUnit;
  }

  // 7. Costs: Contracted maintenance + emergency repairs
  const contractedCost = totalContractedHours * table04Maintenance.contractedHourCost.value;
  const emergencyCost = totalEmergencyRepairHours * table04Maintenance.emergencyBreakdownHourCost.value;
  const maintenanceCostTotal = contractedCost + emergencyCost;

  // Machining operating costs (power, lubricants, tooling)
  const machiningCostTotal = totalAvailableMachineHours * 14.0;

  // 8. Raw material inventory update
  const updatedMaterialsInventory = Math.max(0, company.materials.currentStockUnits - totalMaterialsConsumed);

  const capacityInfo: ProductionCapacityInfo = {
    machineCapacityUnits,
    assemblyCapacityUnits,
    limitingFactor,
    effectiveCapacityUnits,
    requestedUnits: totalRequestedUnits,
    isRestricted,
    actualProductionUnits,
    rejectedUnits,
    scrapIncome: scrapIncomeTotal,
  };

  return {
    capacityInfo,
    updatedMachines,
    updatedMaterialsInventory,
    machiningCostTotal,
    maintenanceCostTotal,
    scrapIncomeTotal,
    guaranteeServicingCostTotal,
    guaranteeReturns,
    contractedMaintenanceHours: totalContractedHours,
    emergencyRepairHours: totalEmergencyRepairHours,
    totalBreakdownHours,
  };
}
