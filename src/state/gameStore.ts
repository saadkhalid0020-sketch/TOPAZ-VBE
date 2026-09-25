import { create } from 'zustand';
import { GameState, GameSettings } from '../types/game';
import { QuarterlyDecisions } from '../types/decisions';
import { QuarterlyReport } from '../types/reports';
import { createNewGame } from '../data/scenarios/initialGame';
import { runQuarter } from '../simulation/engine/simulationRunner';
import { gameRepository } from '../persistence/gameRepository';

interface GameStoreState {
  game: GameState;
  isSimulating: boolean;
  simulationError: string | null;
  lastReport: QuarterlyReport | null;
  activeTab: 'dashboard' | 'marketing' | 'operations' | 'personnel' | 'finance' | 'intelligence' | 'decisions' | 'reports' | 'history' | 'dev';

  // Actions
  startNewGame: (settings?: Partial<GameSettings>) => Promise<void>;
  executeQuarter: (decisions: QuarterlyDecisions) => Promise<boolean>;
  loadGame: (id: string) => Promise<boolean>;
  saveCurrentGame: () => Promise<void>;
  setActiveTab: (tab: GameStoreState['activeTab']) => void;
  setGame: (game: GameState) => void;
  dismissError: () => void;
}

const defaultGame = createNewGame();

export const useGameStore = create<GameStoreState>((set, get) => ({
  game: defaultGame,
  isSimulating: false,
  simulationError: null,
  lastReport: defaultGame.reports[0] || null,
  activeTab: 'dashboard',

  startNewGame: async (settings) => {
    const newGame = createNewGame(settings);
    await gameRepository.saveGame(newGame);
    set({
      game: newGame,
      lastReport: null,
      simulationError: null,
      activeTab: 'dashboard',
    });
  },

  executeQuarter: async (decisions) => {
    const { game } = get();
    set({ isSimulating: true, simulationError: null });

    try {
      // Execute pure deterministic simulation runner
      const { nextGameState, report } = runQuarter(game, decisions);
      
      // Auto-save to Dexie IndexedDB
      await gameRepository.saveGame(nextGameState);

      set({
        game: nextGameState,
        lastReport: report,
        isSimulating: false,
        activeTab: 'reports', // Transition to quarterly report upon completion
      });
      return true;
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
      // Invariant: Do NOT modify existing game state on failure!
      set({
        isSimulating: false,
        simulationError: err?.message || 'Unexpected simulation execution failure.',
      });
      return false;
    }
  },

  loadGame: async (id: string) => {
    try {
      const loaded = await gameRepository.loadGame(id);
      if (loaded) {
        set({
          game: loaded,
          lastReport: loaded.reports[0] || null,
          simulationError: null,
          activeTab: 'dashboard',
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ simulationError: 'Failed to load game from database.' });
      return false;
    }
  },

  saveCurrentGame: async () => {
    const { game } = get();
    await gameRepository.saveGame(game);
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setGame: (game) => set({ game, lastReport: game.reports[0] || null }),

  dismissError: () => set({ simulationError: null }),
}));
