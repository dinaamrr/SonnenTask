/* global fetch, AbortController, setTimeout, clearTimeout */

import { ChargingStatesResponse } from '../types';
import mockData from './mocks/backend-response.json';
import { isValidChargingStatesResponse } from '../utils/dataProcessing';

/**
 * API configuration constants.
 * In a real app, these would come from environment variables.
 */
const API_CONFIG = {
  BASE_URL: 'https://api.sonnen.de', // Placeholder URL
  ENDPOINTS: {
    CHARGING_STATES: '/v1/battery/charging-states',
  },
  TIMEOUT: 10000,
  // Set to true to use mock data (backend not ready)
  USE_MOCK: true,
};

/**
 * Custom error class for API-related errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Simulates network delay for mock data.
 * This helps test loading states in development.
 */
const simulateNetworkDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Fetches charging states from the backend API.
 * Currently uses mock data as the backend is not ready.
 *
 * @throws {ApiError} When the request fails or data is invalid
 */
export const fetchChargingStates = async (): Promise<ChargingStatesResponse> => {
  // Use mock data while backend is being developed
  if (API_CONFIG.USE_MOCK) {
    await simulateNetworkDelay();

    // Validate mock data structure
    if (!isValidChargingStatesResponse(mockData)) {
      throw new ApiError('Invalid mock data structure');
    }

    return mockData as ChargingStatesResponse;
  }

  // Real API implementation (for when backend is ready)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHARGING_STATES}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(`HTTP error ${response.status}: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    if (!isValidChargingStatesResponse(data)) {
      throw new ApiError('Invalid response data structure');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', undefined, error);
      }
      throw new ApiError('Network request failed', undefined, error);
    }

    throw new ApiError('Unknown error occurred');
  }
};

/**
 * Type guard for checking if error is ApiError.
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
