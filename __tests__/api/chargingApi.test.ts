import { fetchChargingStates, ApiError, isApiError } from '../../src/api/chargingApi';

// Mock the mock data
jest.mock('../../src/api/mocks/backend-response.json', () => ({
  chargingStates: [
    {
      date: '2024-09-02T07:00:12.072Z',
      chargingLevel: 42,
      internalEventId: 986073,
    },
    {
      date: '2024-09-02T08:00:02.836Z',
      chargingLevel: 44,
      internalEventId: 347729,
    },
  ],
}));

describe('Charging API', () => {
  describe('fetchChargingStates', () => {
    it('should return charging states from mock data', async () => {
      const result = await fetchChargingStates();

      expect(result).toBeDefined();
      expect(result.chargingStates).toBeDefined();
      expect(Array.isArray(result.chargingStates)).toBe(true);
      expect(result.chargingStates.length).toBeGreaterThan(0);
    });

    it('should return valid charging state structure', async () => {
      const result = await fetchChargingStates();
      const firstState = result.chargingStates[0];

      expect(firstState).toHaveProperty('date');
      expect(firstState).toHaveProperty('chargingLevel');
      expect(firstState).toHaveProperty('internalEventId');
    });
  });

  describe('ApiError', () => {
    it('should create error with message', () => {
      const error = new ApiError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApiError');
    });

    it('should create error with status code', () => {
      const error = new ApiError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with original error', () => {
      const originalError = new Error('Original');
      const error = new ApiError('Wrapped', undefined, originalError);

      expect(error.originalError).toBe(originalError);
    });
  });

  describe('isApiError', () => {
    it('should return true for ApiError instances', () => {
      const error = new ApiError('Test');

      expect(isApiError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Test');

      expect(isApiError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isApiError('error')).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });
});
