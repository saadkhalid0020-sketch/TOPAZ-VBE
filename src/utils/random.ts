/**
 * Deterministic Seeded Pseudo-Random Number Generator (PRNG)
 * Uses Mulberry32 algorithm.
 * 
 * Guarantee: Identical seed + identical sequence of calls => identical outputs.
 * Never uses Math.random().
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    // Ensure 32-bit unsigned integer seed
    this.state = seed >>> 0;
  }

  /**
   * Generates next pseudo-random floating point number in [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }

  /**
   * Generates pseudo-random integer between min and max (inclusive)
   */
  public nextInt(min: number, max: number): number {
    const f = this.next();
    return Math.floor(f * (max - min + 1)) + min;
  }

  /**
   * Generates pseudo-random float between min and max
   */
  public nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates normally distributed random value with given mean and standard deviation
   * Uses Box-Muller transform
   */
  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = Math.max(1e-15, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Returns true with given probability [0, 1]
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Returns current internal seed state for serialization
   */
  public getState(): number {
    return this.state;
  }

  /**
   * Sets internal seed state
   */
  public setState(state: number): void {
    this.state = state >>> 0;
  }
}

/**
 * Creates a new SeededRNG instance
 */
export function createRNG(seed: number): SeededRNG {
  return new SeededRNG(seed);
}
