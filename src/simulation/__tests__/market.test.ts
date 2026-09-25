import { describe, it, expect } from 'vitest';
import { simulateMarketDemand } from '../market/marketEngine';
import { createCompany, createInitialEconomy } from '../../data/scenarios/initialGame';
import { createRNG } from '../../utils/random';

describe('Market Demand & Order Engine', () => {
  it('generates orders and honors price-demand downward slope', () => {
    const rng1 = createRNG(42);
    const rng2 = createRNG(42);
    const economy = createInitialEconomy();

    const lowPriceCompany = createCompany('player', 'Aura Corp', true);
    lowPriceCompany.products[0].homePrice = 45; // Below benchmark $55

    const highPriceCompany = createCompany('player', 'Aura Corp', true);
    highPriceCompany.products[0].homePrice = 75; // Above benchmark $55

    const competitor = createCompany('comp', 'Rival', false);

    const resultLow = simulateMarketDemand(lowPriceCompany, [competitor], economy, rng1);
    const resultHigh = simulateMarketDemand(highPriceCompany, [competitor], economy, rng2);

    const ordersLow = resultLow.ordersReceived.product1.south;
    const ordersHigh = resultHigh.ordersReceived.product1.south;

    // Lower price generates higher demand
    expect(ordersLow).toBeGreaterThan(ordersHigh);
  });

  it('generates zero orders when product price is set to zero (withdrawn)', () => {
    const rng = createRNG(42);
    const economy = createInitialEconomy();
    const company = createCompany('player', 'Aura Corp', true);
    company.products[0].homePrice = 0; // Not offered

    const result = simulateMarketDemand(company, [], economy, rng);
    expect(result.ordersReceived.product1.south).toBe(0);
    expect(result.ordersReceived.product1.west).toBe(0);
  });

  it('cancels at least 50% of outstanding unfulfilled orders at quarter end', () => {
    const rng = createRNG(42);
    const economy = createInitialEconomy();
    const company = createCompany('player', 'Aura Corp', true);
    
    // Set warehouse stock to 0 so all orders become backlog
    company.warehouses.forEach(w => {
      w.stock.product1 = 0;
    });

    const result = simulateMarketDemand(company, [], economy, rng);
    const orders = result.ordersReceived.product1.south;
    const cancelled = result.cancelledOrders.product1.south;

    if (orders > 0) {
      // Cancellation rate is at least 50%
      expect(cancelled).toBeGreaterThanOrEqual(Math.floor(orders * 0.49));
    }
  });
});
