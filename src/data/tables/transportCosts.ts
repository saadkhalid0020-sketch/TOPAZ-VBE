import { createConfigParam } from '../../types/config';

// Table 11: Transport Costs
// Transport cost per unit / journey by owned vehicle vs hired haulage.
// TODO: Populate exact haulage tariff rates from Topaz Table 11
export const table11TransportCosts = {
  source: 'Topaz-VBE Table 11',
  status: 'PENDING_VERIFICATION' as const,
  ownedVehicleRunningCostPerKm: createConfigParam(
    0.85,
    'Topaz Table 11',
    'PENDING_VERIFICATION',
    'Variable operating cost per km for owned delivery vehicles',
    'currency/km'
  ),
  hiredLorryBaseCharge: createConfigParam(
    350.0,
    'Topaz Table 11',
    'PENDING_VERIFICATION',
    'Base flat dispatch charge per hired lorry',
    'currency'
  ),
  hiredLorryCostPerKm: createConfigParam(
    1.60,
    'Topaz Table 11',
    'PENDING_VERIFICATION',
    'Haulage rate per km for hired lorries',
    'currency/km'
  )
};

export const transportCosts = table11TransportCosts;

