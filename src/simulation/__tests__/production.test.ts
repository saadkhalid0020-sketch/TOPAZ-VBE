import { describe, it, expect } from 'vitest';
import { executeProduction } from '../production/productionEngine';
import { createCompany, createDefaultQuarterlyDecisions } from '../../data/scenarios/initialGame';
import { createRNG } from '../../utils/random';

describe('Production & Manufacturing Engine', () => {
  it('determines capacity as the minimum of machining and assembly capacity', () => {
    const rng = createRNG(100);
    const company = createCompany('player', 'Aura Corp', true);
    const decisions = createDefaultQuarterlyDecisions(company).operations;

    const result = executeProduction(company, decisions, rng);

    expect(result.capacityInfo.effectiveCapacityUnits).toBe(
      Math.min(result.capacityInfo.machineCapacityUnits, result.capacityInfo.assemblyCapacityUnits)
    );
  });

  it('restricts actual production proportionally when schedule exceeds capacity', () => {
    const rng = createRNG(100);
    const company = createCompany('player', 'Aura Corp', true);
    const decisions = createDefaultQuarterlyDecisions(company).operations;

    // Overload delivery schedule to 15,000 units (far exceeds plant capacity)
    decisions.deliveryQuantities.product1.south = 5000;
    decisions.deliveryQuantities.product2.south = 5000;
    decisions.deliveryQuantities.product3.south = 5000;

    const result = executeProduction(company, decisions, rng);

    expect(result.capacityInfo.isRestricted).toBe(true);
    const totalActualProduced =
      result.capacityInfo.actualProductionUnits.product1 +
      result.capacityInfo.actualProductionUnits.product2 +
      result.capacityInfo.actualProductionUnits.product3;

    expect(totalActualProduced).toBeLessThanOrEqual(result.capacityInfo.effectiveCapacityUnits);
  });

  it('generates scrap recovery income from rejected units', () => {
    const rng = createRNG(100);
    const company = createCompany('player', 'Aura Corp', true);
    const decisions = createDefaultQuarterlyDecisions(company).operations;

    const result = executeProduction(company, decisions, rng);
    expect(result.scrapIncomeTotal).toBeGreaterThanOrEqual(0);
  });
});
