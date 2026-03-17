import {
  isValidDateString,
  isValidChargingLevel,
  isValidEventId,
  isValidChargingState,
  isValidChargingStatesResponse,
  formatTime,
  formatDate,
  processChargingData,
  getChargingLevelRange,
  calculateChargingStats,
  getAccessibilityLabel,
  generateTimeAxisTicks,
} from '../../src/utils/dataProcessing';
import { ChargingState } from '../../src/types';

describe('Data Validation Functions', () => {
  describe('isValidDateString', () => {
    it('should return true for valid ISO date strings', () => {
      expect(isValidDateString('2024-09-02T07:00:12.072Z')).toBe(true);
      expect(isValidDateString('2024-01-01T00:00:00.000Z')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDateString('not-a-date')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null)).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
      expect(isValidDateString(123)).toBe(false);
    });
  });

  describe('isValidChargingLevel', () => {
    it('should return true for valid charging levels (0-100)', () => {
      expect(isValidChargingLevel(0)).toBe(true);
      expect(isValidChargingLevel(50)).toBe(true);
      expect(isValidChargingLevel(100)).toBe(true);
    });

    it('should return false for invalid charging levels', () => {
      expect(isValidChargingLevel(-1)).toBe(false);
      expect(isValidChargingLevel(101)).toBe(false);
      expect(isValidChargingLevel(NaN)).toBe(false);
      expect(isValidChargingLevel('50')).toBe(false);
      expect(isValidChargingLevel(null)).toBe(false);
    });
  });

  describe('isValidEventId', () => {
    it('should return true for valid event IDs', () => {
      expect(isValidEventId(1)).toBe(true);
      expect(isValidEventId(986073)).toBe(true);
      expect(isValidEventId(1000000)).toBe(true);
    });

    it('should return false for invalid event IDs', () => {
      expect(isValidEventId(0)).toBe(false);
      expect(isValidEventId(-1)).toBe(false);
      expect(isValidEventId(1.5)).toBe(false);
      expect(isValidEventId('123')).toBe(false);
      expect(isValidEventId(null)).toBe(false);
    });
  });

  describe('isValidChargingState', () => {
    it('should return true for valid charging state objects', () => {
      const validState: ChargingState = {
        date: '2024-09-02T07:00:12.072Z',
        chargingLevel: 42,
        internalEventId: 986073,
      };
      expect(isValidChargingState(validState)).toBe(true);
    });

    it('should return false for invalid charging state objects', () => {
      expect(isValidChargingState(null)).toBe(false);
      expect(isValidChargingState({})).toBe(false);
      expect(isValidChargingState({ date: 'invalid' })).toBe(false);
      expect(
        isValidChargingState({
          date: '2024-09-02T07:00:12.072Z',
          chargingLevel: 150, // Invalid level
          internalEventId: 123,
        })
      ).toBe(false);
    });
  });

  describe('isValidChargingStatesResponse', () => {
    it('should return true for valid response structure', () => {
      expect(isValidChargingStatesResponse({ chargingStates: [] })).toBe(true);
      expect(
        isValidChargingStatesResponse({
          chargingStates: [
            {
              date: '2024-09-02T07:00:12.072Z',
              chargingLevel: 42,
              internalEventId: 986073,
            },
          ],
        })
      ).toBe(true);
    });

    it('should return false for invalid response structure', () => {
      expect(isValidChargingStatesResponse(null)).toBe(false);
      expect(isValidChargingStatesResponse({})).toBe(false);
      expect(isValidChargingStatesResponse({ data: [] })).toBe(false);
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatTime', () => {
    it('should format date to HH:mm format', () => {
      const date = new Date('2024-09-02T07:00:00.000Z');
      const result = formatTime(date);
      // Result depends on timezone, but should be in time format
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('formatDate', () => {
    it('should format date to short format', () => {
      const date = new Date('2024-09-02T07:00:00.000Z');
      const result = formatDate(date);
      // Should contain month and day
      expect(result).toContain('Sep');
      expect(result).toMatch(/\d/);
    });
  });
});

describe('Data Processing Functions', () => {
  const mockChargingStates: ChargingState[] = [
    { date: '2024-09-02T07:00:12.072Z', chargingLevel: 42, internalEventId: 1 },
    { date: '2024-09-02T08:00:02.836Z', chargingLevel: 44, internalEventId: 2 },
    { date: '2024-09-02T09:00:07.730Z', chargingLevel: 48, internalEventId: 3 },
    { date: '2024-09-02T10:00:14.169Z', chargingLevel: 45, internalEventId: 4 },
  ];

  describe('processChargingData', () => {
    it('should process and sort charging data', () => {
      const result = processChargingData(mockChargingStates);

      expect(result).toHaveLength(4);
      expect(result[0].level).toBe(42);
      expect(result[1].level).toBe(44);
      expect(result[2].level).toBe(48);
      expect(result[3].level).toBe(45);
    });

    it('should calculate change between readings', () => {
      const result = processChargingData(mockChargingStates);

      expect(result[0].change).toBe(0); // First reading has no previous
      expect(result[1].change).toBe(2); // 44 - 42 = 2
      expect(result[2].change).toBe(4); // 48 - 44 = 4
      expect(result[3].change).toBe(-3); // 45 - 48 = -3
    });

    it('should set isCharging based on change', () => {
      const result = processChargingData(mockChargingStates);

      expect(result[0].isCharging).toBe(false);
      expect(result[1].isCharging).toBe(true); // Positive change
      expect(result[2].isCharging).toBe(true); // Positive change
      expect(result[3].isCharging).toBe(false); // Negative change
    });

    it('should handle empty input', () => {
      const result = processChargingData([]);
      expect(result).toHaveLength(0);
    });

    it('should filter out invalid entries', () => {
      const invalidData = [
        { date: 'invalid-date', chargingLevel: 50, internalEventId: 1 },
        { date: '2024-09-02T07:00:12.072Z', chargingLevel: 42, internalEventId: 2 },
      ];
      const result = processChargingData(invalidData);
      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(42);
    });
  });

  describe('getChargingLevelRange', () => {
    it('should return min and max levels with padding', () => {
      const processedData = processChargingData(mockChargingStates);
      const range = getChargingLevelRange(processedData);

      expect(range.min).toBeLessThanOrEqual(42);
      expect(range.max).toBeGreaterThanOrEqual(48);
    });

    it('should return default range for empty data', () => {
      const range = getChargingLevelRange([]);
      expect(range).toEqual({ min: 0, max: 100 });
    });
  });

  describe('calculateChargingStats', () => {
    it('should calculate statistics correctly', () => {
      const processedData = processChargingData(mockChargingStates);
      const stats = calculateChargingStats(processedData);

      expect(stats.currentLevel).toBe(45);
      expect(stats.maxLevel).toBe(48);
      expect(stats.minLevel).toBe(42);
      expect(stats.totalCharged).toBe(6); // 2 + 4 = 6
      expect(stats.totalConsumed).toBe(3); // |-3| = 3
      expect(stats.chargingPeriods).toBe(2);
      expect(stats.consumptionPeriods).toBe(1);
    });

    it('should return zeros for empty data', () => {
      const stats = calculateChargingStats([]);

      expect(stats.currentLevel).toBe(0);
      expect(stats.maxLevel).toBe(0);
      expect(stats.minLevel).toBe(0);
      expect(stats.totalCharged).toBe(0);
      expect(stats.totalConsumed).toBe(0);
    });
  });

  describe('getAccessibilityLabel', () => {
    it('should generate correct label for charging state', () => {
      const processedData = processChargingData(mockChargingStates);
      const label = getAccessibilityLabel(processedData[1]);

      expect(label).toContain('Battery level 44 percent');
      expect(label).toContain('charging');
      expect(label).toContain('increased by 2 percent');
    });

    it('should generate correct label for consuming state', () => {
      const processedData = processChargingData(mockChargingStates);
      const label = getAccessibilityLabel(processedData[3]);

      expect(label).toContain('Battery level 45 percent');
      expect(label).toContain('consuming energy');
      expect(label).toContain('decreased by 3 percent');
    });
  });

  describe('generateTimeAxisTicks', () => {
    it('should generate appropriate number of ticks', () => {
      const processedData = processChargingData(mockChargingStates);
      const ticks = generateTimeAxisTicks(processedData, 3);

      expect(ticks.length).toBeLessThanOrEqual(4); // maxTicks + possible last point
      expect(ticks.length).toBeGreaterThan(0);
    });

    it('should always include last data point', () => {
      const processedData = processChargingData(mockChargingStates);
      const ticks = generateTimeAxisTicks(processedData, 2);
      const lastTimestamp = processedData[processedData.length - 1].timestamp;

      expect(ticks).toContain(lastTimestamp);
    });

    it('should return all timestamps if less than maxTicks', () => {
      const processedData = processChargingData(mockChargingStates);
      const ticks = generateTimeAxisTicks(processedData, 10);

      expect(ticks).toHaveLength(4);
    });
  });
});
