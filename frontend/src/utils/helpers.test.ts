import { describe, it, expect } from 'vitest';
import { calculateDistance, formatNumber, formatTime } from '../utils/helpers';

describe('Helper Functions', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      expect(calculateDistance(0, 0, 3, 4)).toBe(5);
      expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(500)).toBe('500');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(3661)).toBe('1h 1m');
      expect(formatTime(65)).toBe('1m 5s');
      expect(formatTime(30)).toBe('30s');
    });
  });
});
