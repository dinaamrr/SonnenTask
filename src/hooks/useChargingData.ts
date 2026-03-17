import { useState, useEffect, useCallback } from 'react';
import { ProcessedChargingData, LoadingState, ApiState } from '../types';
import { fetchChargingStates, ApiError } from '../api/chargingApi';
import { processChargingData, calculateChargingStats } from '../utils/dataProcessing';

/**
 * Return type for the useChargingData hook.
 */
interface UseChargingDataResult {
  /** Processed charging data ready for visualization */
  data: ProcessedChargingData[];
  /** Current loading state */
  loadingState: LoadingState;
  /** Error message if any */
  error: string | null;
  /** Calculated statistics from the data */
  stats: ReturnType<typeof calculateChargingStats>;
  /** Function to refresh the data */
  refresh: () => Promise<void>;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Whether there was an error */
  isError: boolean;
  /** Whether data is empty */
  isEmpty: boolean;
}

/**
 * Custom hook for fetching and managing charging data.
 * Handles loading states, error handling, and data processing.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, refresh } = useChargingData();
 * ```
 */
export const useChargingData = (): UseChargingDataResult => {
  const [state, setState] = useState<ApiState<ProcessedChargingData[]>>({
    data: null,
    loadingState: LoadingState.IDLE,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loadingState: LoadingState.LOADING,
      error: null,
    }));

    try {
      const response = await fetchChargingStates();
      const processedData = processChargingData(response.chargingStates);

      setState({
        data: processedData,
        loadingState: LoadingState.SUCCESS,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      setState(prev => ({
        ...prev,
        loadingState: LoadingState.ERROR,
        error: errorMessage,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const data = state.data ?? [];
  const stats = calculateChargingStats(data);

  return {
    data,
    loadingState: state.loadingState,
    error: state.error,
    stats,
    refresh: fetchData,
    isLoading: state.loadingState === LoadingState.LOADING,
    isError: state.loadingState === LoadingState.ERROR,
    isEmpty: state.loadingState === LoadingState.SUCCESS && data.length === 0,
  };
};
