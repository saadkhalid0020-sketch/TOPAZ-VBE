import { db, SavedGameRecord } from './database';
import { GameState } from '../types/game';

export const gameRepository = {
  async saveGame(game: GameState): Promise<void> {
    const record: SavedGameRecord = {
      id: game.id,
      name: game.name,
      year: game.year,
      quarter: game.quarter,
      sharePrice: game.player.sharePrice,
      cash: game.player.cash,
      createdAt: game.createdAt,
      updatedAt: Date.now(),
      state: game,
    };
    await db.games.put(record);
  },

  async loadGame(id: string): Promise<GameState | null> {
    const record = await db.games.get(id);
    return record ? record.state : null;
  },

  async listGames(): Promise<SavedGameRecord[]> {
    return await db.games.orderBy('updatedAt').reverse().toArray();
  },

  async deleteGame(id: string): Promise<void> {
    await db.games.delete(id);
  },

  exportGameToJson(game: GameState): string {
    return JSON.stringify(game, null, 2);
  },

  importGameFromJson(jsonString: string): GameState {
    const parsed = JSON.parse(jsonString) as GameState;
    if (!parsed.id || !parsed.player || !parsed.economy) {
      throw new Error('Invalid game save file format');
    }
    return parsed;
  },
};
