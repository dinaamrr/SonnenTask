/**
 * Represents a single charging state data point from the backend API.
 */
export interface ChargingState {
  /** ISO 8601 date string */
  date: string;
  /** Battery charging level as percentage (0-100) */
  chargingLevel: number;
  /** Internal event identifier from the backend */
  internalEventId: number;
}

/**
 * Response structure from the charging states API endpoint.
 */
export interface ChargingStatesResponse {
  chargingStates: ChargingState[];
}

/**
 * Processed charging data point for visualization.
 */
export interface ProcessedChargingData {
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Formatted time string for display */
  timeLabel: string;
  /** Formatted date string for display */
  dateLabel: string;
  /** Battery level percentage */
  level: number;
  /** Change from previous reading */
  change: number;
  /** Indicates if the battery was charging at this point */
  isCharging: boolean;
  /** Original event ID */
  eventId: number;
}

/**
 * State enum for API request status.
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Generic API response wrapper with loading state.
 */
export interface ApiState<T> {
  data: T | null;
  loadingState: LoadingState;
  error: string | null;
}

/**
 * Chart data point for Victory charts.
 */
export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

/**
 * Color scheme constants for the app.
 */
export const Colors = {
  // Primary colors
  primary: '#FF6B00', // sonnen brand orange
  primaryLight: '#FF8C33',
  primaryDark: '#CC5500',

  // Status colors (WCAG AA compliant)
  charging: '#2E7D32', // Green for charging
  chargingLight: '#4CAF50',
  consuming: '#C62828', // Red for consuming
  consumingLight: '#EF5350',
  neutral: '#616161', // Gray for no change

  // Background colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',

  // Text colors
  textPrimary: '#212121',
  textSecondary: '#616161',
  textDisabled: '#9E9E9E',
  textOnPrimary: '#FFFFFF',

  // Chart colors
  chartLine: '#FF6B00',
  chartFill: 'rgba(255, 107, 0, 0.15)',
  chartGrid: '#E0E0E0',
  chartAxis: '#9E9E9E',

  // Other
  border: '#E0E0E0',
  divider: '#EEEEEE',
  error: '#D32F2F',
  success: '#388E3C',
} as const;

/**
 * Typography constants.
 */
export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Spacing constants (following 4pt grid system).
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Border radius constants.
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
