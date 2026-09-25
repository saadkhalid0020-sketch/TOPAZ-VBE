import { ProductId } from '../../types/product';
import { MarketId, MarketState } from '../../types/market';
import { CompanyState, WarehouseState } from '../../types/company';
import { OperationsDecisions } from '../../types/decisions';
import { VehicleState } from '../../types/production';
import { table09VehicleCapacity } from '../../data/tables/vehicleCapacity';
import { table10JourneyTimes } from '../../data/tables/journeyTimes';
import { table11TransportCosts } from '../../data/tables/transportCosts';
import { table12WarehousePurchasingCosts } from '../../data/tables/warehousePurchasingCosts';
import { table14SupplierTerms } from '../../data/tables/supplierTerms';
import { table18MachinesVehicles } from '../../data/tables/machinesVehicles';
import { safeDivide } from '../../utils/math';

export interface LogisticsExecutionResult {
  updatedWarehouses: WarehouseState[];
  updatedVehicles: VehicleState[];
  materialOrderCost: number;
  materialDeliveredUnits: number;
  transportCostsTotal: number;
  warehousingCostsTotal: number;
  purchasingAdminCost: number;
  ownVehicleTrips: number;
  hiredLorryTrips: number;
}

export function executeLogistics(
  company: CompanyState,
  decisions: OperationsDecisions,
  actualProductionUnits: Record<ProductId, number>
): LogisticsExecutionResult {
  const products: ProductId[] = ['product1', 'product2', 'product3'];
  const markets: MarketId[] = ['south', 'west', 'north', 'export'];

  // 1. Process vehicle fleet update and depreciation
  const updatedVehicles: VehicleState[] = company.vehicles.map(v => ({
    ...v,
    ageQuarters: v.ageQuarters + 1,
    bookValue: v.bookValue * (1 - table18MachinesVehicles.vehicleQuarterlyDepreciationRate.value),
  }));

  // Handle vehicle buy/sell decisions
  if (decisions.vehiclesToBuy > 0) {
    for (let i = 0; i < decisions.vehiclesToBuy; i++) {
      updatedVehicles.push({
        id: `V-${Date.now().toString().slice(-4)}-${i}`,
        capacityUnits: table09VehicleCapacity.ownedVehicleCapacityUnits.value,
        bookValue: table18MachinesVehicles.vehicleCostNew.value,
        ageQuarters: 0,
      });
    }
  }

  if (decisions.vehiclesToSell > 0) {
    const toRemove = Math.min(decisions.vehiclesToSell, updatedVehicles.length);
    updatedVehicles.splice(0, toRemove);
  }

  // 2. Transport calculation from South factory to regional warehouses
  // Calculate total units to dispatch
  let totalDispatchedUnits = 0;
  const dispatchByMarket: Record<MarketId, number> = { south: 0, west: 0, north: 0, export: 0 };

  for (const mkt of markets) {
    let mktUnits = 0;
    for (const prodId of products) {
      const scheduled = decisions.deliveryQuantities[prodId]?.[mkt] || 0;
      if (scheduled > 0) {
        mktUnits += scheduled;
      }
    }
    dispatchByMarket[mkt] = mktUnits;
    totalDispatchedUnits += mktUnits;
  }

  // Capacity of owned vehicles: capacityUnits * maxTripsPerQuarter
  const ownedFleet = updatedVehicles.length;
  const maxOwnedTrips = ownedFleet * table09VehicleCapacity.maxTripsPerOwnedVehiclePerQuarter.value;
  const ownedCapacityPerTrip = table09VehicleCapacity.ownedVehicleCapacityUnits.value;
  const totalOwnedCapacity = maxOwnedTrips * ownedCapacityPerTrip;

  let ownVehicleTrips = 0;
  let hiredLorryTrips = 0;
  let transportCostsTotal = 0;

  for (const mkt of markets) {
    const units = dispatchByMarket[mkt];
    if (units <= 0) continue;

    // Distances
    const km =
      mkt === 'south'
        ? 0
        : mkt === 'west'
        ? 250
        : mkt === 'north'
        ? 400
        : 600;

    // Determine trips needed for this market
    const tripsForMarket = Math.ceil(units / ownedCapacityPerTrip);

    // Prioritize owned vehicles
    const ownedTripsUsed = Math.min(tripsForMarket, Math.max(0, maxOwnedTrips - ownVehicleTrips));
    const hiredTripsNeeded = tripsForMarket - ownedTripsUsed;

    ownVehicleTrips += ownedTripsUsed;
    hiredLorryTrips += hiredTripsNeeded;

    // Owned vehicle variable running costs: 2 * distance * cost/km
    const ownedCost = ownedTripsUsed * (km * 2) * table11TransportCosts.ownedVehicleRunningCostPerKm.value;

    // Hired transport cost: flat charge + (2 * distance * cost/km)
    const hiredCost =
      hiredTripsNeeded *
      (table11TransportCosts.hiredLorryBaseCharge.value + (km * 2) * table11TransportCosts.hiredLorryCostPerKm.value);

    transportCostsTotal += ownedCost + hiredCost;
  }

  // 3. Warehouse inventory updates including negative deliveries (transfers)
  const updatedWarehouses: WarehouseState[] = [];
  let warehousingCostsTotal = 0;

  for (const mkt of markets) {
    const existingWarehouse = company.warehouses.find(w => w.marketId === mkt);
    const newStock: Record<ProductId, number> = { product1: 0, product2: 0, product3: 0 };
    let openingTotal = 0;
    let closingTotal = 0;

    for (const prodId of products) {
      const openingStock = existingWarehouse?.stock[prodId] || 0;
      openingTotal += openingStock;

      // Delivery quantity from decision (positive = inbound delivery, negative = outbound transfer)
      const deliveryQty = decisions.deliveryQuantities[prodId]?.[mkt] || 0;
      
      // Stock after deliveries and transfers (floor at 0)
      const postDeliveryStock = Math.max(0, openingStock + deliveryQty);
      newStock[prodId] = postDeliveryStock;
      closingTotal += postDeliveryStock;
    }

    // Average stock calculation: (Opening + Closing) / 2
    const averageStock = Math.round((openingTotal + closingTotal) / 2);

    // Warehouse cost: fixed base lease fee + storage cost based on average stock
    const fixedLease = table12WarehousePurchasingCosts.warehouseFixedChargePerMarket.value;
    const variableStorage = averageStock * table12WarehousePurchasingCosts.finishedUnitStorageCostPerQuarter.value;
    warehousingCostsTotal += fixedLease + variableStorage;

    updatedWarehouses.push({
      marketId: mkt,
      stock: newStock,
      capacityUnits: existingWarehouse?.capacityUnits || 3000,
      averageQuarterlyStock: averageStock,
    });
  }

  // 4. Raw Material Purchasing from Suppliers 0, 1, 2, 3
  const supplierId = decisions.materialOrder.supplierId;
  const orderedUnits = Math.max(0, decisions.materialOrder.units);
  let materialOrderCost = 0;
  let materialDeliveredUnits = orderedUnits;

  const supplierConfig =
    supplierId === 0
      ? table14SupplierTerms.supplier0
      : supplierId === 1
      ? table14SupplierTerms.supplier1
      : supplierId === 2
      ? table14SupplierTerms.supplier2
      : table14SupplierTerms.supplier3;

  const basePrice = supplierConfig.basePricePerUnit.value;
  let discountRate = 0;

  for (const tier of supplierConfig.volumeDiscountTiers) {
    if (orderedUnits >= tier.threshold) {
      discountRate = Math.max(discountRate, tier.discountPercent);
    }
  }

  materialOrderCost = orderedUnits * basePrice * (1 - discountRate);

  const purchasingAdminCost =
    orderedUnits > 0 ? table12WarehousePurchasingCosts.purchaseOrderAdminCharge.value : 0;

  return {
    updatedWarehouses,
    updatedVehicles,
    materialOrderCost,
    materialDeliveredUnits,
    transportCostsTotal,
    warehousingCostsTotal,
    purchasingAdminCost,
    ownVehicleTrips,
    hiredLorryTrips,
  };
}
