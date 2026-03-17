import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useChargingData } from '../../src/hooks/useChargingData';
import * as chargingApi from '../../src/api/chargingApi';

// Mock the API module
jest.mock('../../src/api/chargingApi');

const mockChargingApi = chargingApi as jest.Mocked<typeof chargingApi>;

const mockChargingStates = [
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
  {
    date: '2024-09-02T09:00:52.129Z',
    chargingLevel: 55,
    internalEventId: 423911,
  },
];

describe('useChargingData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockChargingApi.fetchChargingStates.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useChargingData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    // data starts as empty array based on hook implementation
    expect(result.current.data).toEqual([]);
  });

  it('should fetch and process data successfully', async () => {
    mockChargingApi.fetchChargingStates.mockResolvedValue({
      chargingStates: mockChargingStates,
    });

    const { result } = renderHook(() => useChargingData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
    expect(result.current.data).toHaveLength(3);
  });

  it('should calculate correct statistics', async () => {
    mockChargingApi.fetchChargingStates.mockResolvedValue({
      chargingStates: mockChargingStates,
    });

    const { result } = renderHook(() => useChargingData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Stats are returned via stats property
    expect(result.current.stats.currentLevel).toBe(55); // Last item
    expect(result.current.stats.maxLevel).toBe(55);
    expect(result.current.stats.minLevel).toBe(42);
    expect(result.current.stats.avgLevel).toBeCloseTo(47, 0); // (42+44+55)/3
  });

  it('should handle API errors', async () => {
    const testError = new Error('Network error');
    mockChargingApi.fetchChargingStates.mockRejectedValue(testError);

    const { result } = renderHook(() => useChargingData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Error is stored as string message
    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    expect(result.current.isError).toBe(true);
  });

  it('should provide a refresh function', async () => {
    mockChargingApi.fetchChargingStates.mockResolvedValue({
      chargingStates: mockChargingStates,
    });

    const { result } = renderHook(() => useChargingData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Should have been called twice (initial + refresh)
    expect(mockChargingApi.fetchChargingStates).toHaveBeenCalledTimes(2);
  });

  it('should set loading state during refresh', async () => {
    let resolvePromise: (value: any) => void;

    mockChargingApi.fetchChargingStates.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useChargingData());

    // Initial loading
    expect(result.current.isLoading).toBe(true);

    // Resolve initial fetch
    await act(async () => {
      resolvePromise!({ chargingStates: mockChargingStates });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger refresh - set up new promise
    mockChargingApi.fetchChargingStates.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should sort states by date', async () => {
    const unsortedStates = [
      {
        date: '2024-09-02T09:00:52.129Z',
        chargingLevel: 55,
        internalEventId: 3,
      },
      {
        date: '2024-09-02T07:00:12.072Z',
        chargingLevel: 42,
        internalEventId: 1,
      },
      {
        date: '2024-09-02T08:00:02.836Z',
        chargingLevel: 44,
        internalEventId: 2,
      },
    ];

    mockChargingApi.fetchChargingStates.mockResolvedValue({
      chargingStates: unsortedStates,
    });

    const { result } = renderHook(() => useChargingData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const data = result.current.data;
    expect(data[0].level).toBe(42); // 07:00
    expect(data[1].level).toBe(44); // 08:00
    expect(data[2].level).toBe(55); // 09:00
  });
});
