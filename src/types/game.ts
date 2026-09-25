// Core game types modeled on Topaz-VBE simulation

import { CompanyState } from './company';
import { EconomyState } from './market';
import { QuarterlyDecisions, DecisionHistory } from './decisions';
import { QuarterlyReport } from './reports';

export type QuarterNumber = 1 | 2 | 3 | 4;

export interface HistoricalSnapshot {
  year: number;
  quarter: QuarterNumber;
  revenue: number;
  profit: number;
  cash: number;
  debt: number;
  inventory: number;
  marketShare: number;
  sharePrice: number;
  employees: number;
  production: number;
  sales: number;
  netWorth: number;
}

export interface GameSettings {
  companyName: string;
  seed: number;
  initialCash: number;
  competitorCount: number;
  difficulty: 'normal' | 'challenging';
}

export interface GameState {
  id: string;
  name: string;
  seed: number;
  year: number;
  quarter: QuarterNumber;
  economy: EconomyState;
  player: CompanyState;
  competitors: CompanyState[];
  decisions: DecisionHistory[];
  reports: QuarterlyReport[];
  history: HistoricalSnapshot[];
  status: 'setup' | 'active' | 'completed';
  createdAt: number;
  updatedAt: number;
}
