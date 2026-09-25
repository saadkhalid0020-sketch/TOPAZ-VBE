import { describe, it, expect } from 'vitest';
import { createRNG } from '../../utils/random';

describe('Seeded RNG Determinism', () => {
  it('generates identical sequence from the same seed', () => {
    const seed = 987654;
    const rng1 = createRNG(seed);
    const rng2 = createRNG(seed);

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('generates different sequence from different seeds', () => {
    const rng1 = createRNG(1111);
    const rng2 = createRNG(2222);

    let identical = true;
    for (let i = 0; i < 10; i++) {
      if (rng1.next() !== rng2.next()) {
        identical = false;
        break;
      }
    }
    expect(identical).toBe(false);
  });
});
