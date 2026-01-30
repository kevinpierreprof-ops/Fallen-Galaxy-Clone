/**
 * Seeded Random Number Generator
 * 
 * Provides deterministic random number generation for reproducible maps.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 */

/**
 * Seeded Random Number Generator Class
 * 
 * Generates pseudo-random numbers based on a seed for reproducible results.
 */
export class SeededRandom {
  private seed: number;
  private readonly m = 0x80000000; // 2^31
  private readonly a = 1103515245;
  private readonly c = 12345;

  /**
   * Create a new seeded random generator
   * 
   * @param seed - Seed value (string or number)
   */
  constructor(seed: string | number = Date.now()) {
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed;
    }
    // Ensure seed is within range
    this.seed = this.seed % this.m;
  }

  /**
   * Hash a string to a number
   * 
   * @param str - String to hash
   * @returns Hash value
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get next random integer
   * 
   * @returns Random integer
   */
  private next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed;
  }

  /**
   * Generate random float between 0 and 1
   * 
   * @returns Random float [0, 1)
   */
  public random(): number {
    return this.next() / this.m;
  }

  /**
   * Generate random integer between min and max (inclusive)
   * 
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random integer [min, max]
   */
  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   * 
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random float [min, max)
   */
  public randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Pick random element from array
   * 
   * @param array - Array to pick from
   * @returns Random element
   */
  public pick<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Shuffle array in place
   * 
   * @param array - Array to shuffle
   * @returns Shuffled array
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate random boolean
   * 
   * @param probability - Probability of true (0-1)
   * @returns Random boolean
   */
  public randomBool(probability: number = 0.5): boolean {
    return this.random() < probability;
  }

  /**
   * Reset the generator with a new seed
   * 
   * @param seed - New seed value
   */
  public reset(seed: string | number): void {
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed;
    }
    this.seed = this.seed % this.m;
  }

  /**
   * Get current seed
   * 
   * @returns Current seed value
   */
  public getSeed(): number {
    return this.seed;
  }
}
