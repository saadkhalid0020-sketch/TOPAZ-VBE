import { createConfigParam, ConfigParam } from '../../types/config';

// Table 1: Demographics
// TODO: Populate exact demographic and regional market size indices from Topaz Table 1
export const table01Demographics = {
  source: 'Topaz-VBE Table 1',
  status: 'PENDING_VERIFICATION' as const,
  southMarketWeight: createConfigParam(
    1.0,
    'Topaz Table 1',
    'PENDING_VERIFICATION',
    'South regional market base demographic index (home factory market)'
  ),
  westMarketWeight: createConfigParam(
    0.85,
    'Topaz Table 1',
    'PENDING_VERIFICATION',
    'West regional market base demographic index'
  ),
  northMarketWeight: createConfigParam(
    1.15,
    'Topaz Table 1',
    'PENDING_VERIFICATION',
    'North regional market base demographic index'
  ),
  exportMarketWeight: createConfigParam(
    1.30,
    'Topaz Table 1',
    'PENDING_VERIFICATION',
    'Export regional market base demographic index'
  ),
  factoryDistanceKm: {
    south: createConfigParam(0, 'Topaz Table 1', 'VERIFIED', 'Factory located in South'),
    west: createConfigParam(250, 'Topaz Table 1', 'PENDING_VERIFICATION', 'Estimated distance from factory'),
    north: createConfigParam(400, 'Topaz Table 1', 'PENDING_VERIFICATION', 'Estimated distance from factory'),
    export: createConfigParam(600, 'Topaz Table 1', 'PENDING_VERIFICATION', 'Estimated distance to export port'),
  }
};

export const demographics = table01Demographics;

