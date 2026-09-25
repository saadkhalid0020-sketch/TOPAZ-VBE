import Dexie, { Table } from 'dexie';
import { GameState } from '../types/game';
import { QuarterlyReport } from '../types/reports';

export interface SavedGameRecord {
  id: string;
  name: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  sharePrice: number;
  cash: number;
  createdAt: number;
  updatedAt: number;
  state: GameState;
}

export class TopazDatabase extends Dexie {
  games!: Table<SavedGameRecord, string>;
  reports!: Table<QuarterlyReport, string>;

  constructor() {
    super('TopazSimulationDB');

    this.version(1).stores({
      games: 'id, name, year, quarter, updatedAt',
      reports: 'id, gameId, year, quarter, timestamp',
    });
  }
}

export const db = new TopazDatabase();
