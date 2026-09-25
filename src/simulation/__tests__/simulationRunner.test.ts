import { describe, it, expect } from 'vitest';
import { runQuarter } from '../engine/simulationRunner';
import { createNewGame, createDefaultQuarterlyDecisions } from '../../data/scenarios/initialGame';

describe('Quarterly Simulation Runner Integration', () => {
  it('executes a full quarter deterministically and advances period', () => {
    const game = createNewGame({ seed: 456789 });
    const decisions = createDefaultQuarterlyDecisions(game.player);

    const { nextGameState, report } = runQuarter(game, decisions);

    expect(nextGameState.year).toBe(1);
    expect(nextGameState.quarter).toBe(2);
    expect(nextGameState.history.length).toBe(game.history.length + 1);
    expect(nextGameState.reports.length).toBe(1);

    expect(report.year).toBe(1);
    expect(report.quarter).toBe(1);
    expect(report.incomeStatement.revenue).toBeGreaterThan(0);
    expect(report.balanceSheet.isBalanced).toBe(true);

    // Invariant tests
    expect(nextGameState.player.sharePrice).toBeGreaterThan(0);
    expect(nextGameState.player.materials.currentStockUnits).toBeGreaterThanOrEqual(0);
    expect(nextGameState.player.employees.salespeople).toBeGreaterThanOrEqual(0);
    expect(nextGameState.player.machines.length).toBeGreaterThan(0);
  });

  it('runs across multiple consecutive quarters maintaining financial balance', () => {
    let currentState = createNewGame({ seed: 777888 });

    for (let q = 1; q <= 4; q++) {
      const decisions = createDefaultQuarterlyDecisions(currentState.player);
      const { nextGameState, report } = runQuarter(currentState, decisions);
      
      expect(report.balanceSheet.isBalanced).toBe(true);
      expect(nextGameState.player.sharePrice).toBeGreaterThan(0);
      currentState = nextGameState;
    }

    // After 4 quarters, should be in Year 2 Quarter 1
    expect(currentState.year).toBe(2);
    expect(currentState.quarter).toBe(1);
    expect(currentState.history.length).toBe(5);
  });
});
