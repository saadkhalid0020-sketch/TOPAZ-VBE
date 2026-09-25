import { createConfigParam } from '../../types/config';

// Table 12: Warehouse / Purchasing Costs
// Regional warehouse fixed and variable storage cost, order administrative processing fee.
// TODO: Populate exact warehouse square foot/pallet rates from Topaz Table 12
export const table12WarehousePurchasingCosts = {
  source: 'Topaz-VBE Table 12',
  status: 'PENDING_VERIFICATION' as const,
  warehouseFixedChargePerMarket: createConfigParam(
    1800,
    'Topaz Table 12',
    'PENDING_VERIFICATION',
    'Base quarterly warehouse lease fee per regional market',
    'currency'
  ),
  finishedUnitStorageCostPerQuarter: createConfigParam(
    1.25,
    'Topaz Table 12',
    'PENDING_VERIFICATION',
    'Storage cost per finished unit based on average quarterly stock',
    'currency/unit'
  ),
  rawMaterialStorageCostPerQuarter: createConfigParam(
    0.40,
    'Topaz Table 12',
    'PENDING_VERIFICATION',
    'Storage cost per raw material unit held in warehouse',
    'currency/unit'
  ),
  purchaseOrderAdminCharge: createConfigParam(
    250,
    'Topaz Table 12',
    'PENDING_VERIFICATION',
    'Administrative paperwork cost per purchase order placed',
    'currency'
  )
};

export const warehousePurchasingCosts = table12WarehousePurchasingCosts;

