/**
 * Easing Functions
 * 
 * Mathematical easing functions for natural animations
 */

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Easing functions collection
 */
export class Easing {
  /**
   * Linear easing (no easing)
   */
  static linear(t: number): number {
    return t;
  }

  /**
   * Ease in (quadratic)
   */
  static easeInQuad(t: number): number {
    return t * t;
  }

  /**
   * Ease out (quadratic)
   */
  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  /**
   * Ease in-out (quadratic)
   */
  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Ease in (cubic)
   */
  static easeInCubic(t: number): number {
    return t * t * t;
  }

  /**
   * Ease out (cubic)
   */
  static easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }

  /**
   * Ease in-out (cubic)
   */
  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Ease in (quartic)
   */
  static easeInQuart(t: number): number {
    return t * t * t * t;
  }

  /**
   * Ease out (quartic)
   */
  static easeOutQuart(t: number): number {
    return 1 - (--t) * t * t * t;
  }

  /**
   * Ease in-out (quartic)
   */
  static easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  }

  /**
   * Ease in (quintic)
   */
  static easeInQuint(t: number): number {
    return t * t * t * t * t;
  }

  /**
   * Ease out (quintic)
   */
  static easeOutQuint(t: number): number {
    return 1 + (--t) * t * t * t * t;
  }

  /**
   * Ease in-out (quintic)
   */
  static easeInOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
  }

  /**
   * Ease in (exponential)
   */
  static easeInExpo(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  }

  /**
   * Ease out (exponential)
   */
  static easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * Ease in-out (exponential)
   */
  static easeInOutExpo(t: number): number {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  }

  /**
   * Ease in (circular)
   */
  static easeInCirc(t: number): number {
    return 1 - Math.sqrt(1 - t * t);
  }

  /**
   * Ease out (circular)
   */
  static easeOutCirc(t: number): number {
    return Math.sqrt(1 - (--t) * t);
  }

  /**
   * Ease in-out (circular)
   */
  static easeInOutCirc(t: number): number {
    return t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  }

  /**
   * Ease in (back)
   */
  static easeInBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  }

  /**
   * Ease out (back)
   */
  static easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * Ease in-out (back)
   */
  static easeInOutBack(t: number): number {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }

  /**
   * Ease in (elastic)
   */
  static easeInElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }

  /**
   * Ease out (elastic)
   */
  static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  /**
   * Ease in-out (elastic)
   */
  static easeInOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }

  /**
   * Ease out (bounce)
   */
  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  /**
   * Ease in (bounce)
   */
  static easeInBounce(t: number): number {
    return 1 - Easing.easeOutBounce(1 - t);
  }

  /**
   * Ease in-out (bounce)
   */
  static easeInOutBounce(t: number): number {
    return t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
  }
}

export default Easing;
