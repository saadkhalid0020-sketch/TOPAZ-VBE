import { MarketId, DemographicProfile } from '../types/market';

export interface MarketDefinition {
  id: MarketId;
  name: string;
  isHome: boolean;
  distanceKm: number;
  demographic: DemographicProfile;
  baseQuarterlyDemandWeight: number;
}

export const MARKET_DEFINITIONS: Record<MarketId, MarketDefinition> = {
  south: {
    id: 'south',
    name: 'South (Home & Factory Area)',
    isHome: true,
    distanceKm: 0,
    demographic: {
      name: 'South Industrial / Residential Core',
      populationIndex: 100,
      incomeIndex: 100,
      commercialActivityIndex: 105,
      distanceFromFactoryKm: 0,
    },
    baseQuarterlyDemandWeight: 1.0,
  },
  west: {
    id: 'west',
    name: 'West Market Area',
    isHome: false,
    distanceKm: 250,
    demographic: {
      name: 'West Coastal Commercial Region',
      populationIndex: 85,
      incomeIndex: 110,
      commercialActivityIndex: 90,
      distanceFromFactoryKm: 250,
    },
    baseQuarterlyDemandWeight: 0.85,
  },
  north: {
    id: 'north',
    name: 'North Market Area',
    isHome: false,
    distanceKm: 400,
    demographic: {
      name: 'North Metropolitan Belt',
      populationIndex: 120,
      incomeIndex: 95,
      commercialActivityIndex: 115,
      distanceFromFactoryKm: 400,
    },
    baseQuarterlyDemandWeight: 1.15,
  },
  export: {
    id: 'export',
    name: 'Export Market',
    isHome: false,
    distanceKm: 600,
    demographic: {
      name: 'Overseas Commercial Retail Consortium',
      populationIndex: 140,
      incomeIndex: 105,
      commercialActivityIndex: 130,
      distanceFromFactoryKm: 600,
    },
    baseQuarterlyDemandWeight: 1.30,
  },
};
