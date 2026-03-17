import { ChargingState, ChargingStatesResponse, ProcessedChargingData } from '../types';

/**
 * Validates if a value is a valid ISO 8601 date string.
 */
export const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Validates if a value is a valid charging level (0-100).
 */
export const isValidChargingLevel = (value: unknown): value is number => {
  return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
};

/**
 * Validates if a value is a valid event ID.
 */
export const isValidEventId = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

/**
 * Validates a single charging state object.
 */
export const isValidChargingState = (state: unknown): state is ChargingState => {
  if (!state || typeof state !== 'object') return false;

  const s = state as Record<string, unknown>;

  return (
    isValidDateString(s.date) &&
    isValidChargingLevel(s.chargingLevel) &&
    isValidEventId(s.internalEventId)
  );
};

/**
 * Validates the entire API response structure.
 */
export const isValidChargingStatesResponse = (
  response: unknown
): response is ChargingStatesResponse => {
  if (!response || typeof response !== 'object') return false;

  const r = response as Record<string, unknown>;

  if (!Array.isArray(r.chargingStates)) return false;

  // We allow partial valid data - filter out invalid entries
  return true;
};

/**
 * Formats a date to a time string (e.g., "07:00").
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Formats a date to a short date string (e.g., "Sep 2").
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date to a full datetime string for accessibility.
 */
export const formatFullDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Processes raw charging states into visualization-ready data.
 * Sorts by date and calculates changes between readings.
 */
export const processChargingData = (states: ChargingState[]): ProcessedChargingData[] => {
  // Filter valid states and sort by date
  const validStates = states
    .filter(isValidChargingState)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return validStates.map((state, index) => {
    const date = new Date(state.date);
    const previousLevel = index > 0 ? validStates[index - 1].chargingLevel : state.chargingLevel;
    const change = state.chargingLevel - previousLevel;

    return {
      timestamp: date.getTime(),
      timeLabel: formatTime(date),
      dateLabel: formatDate(date),
      level: state.chargingLevel,
      change,
      isCharging: change > 0,
      eventId: state.internalEventId,
    };
  });
};

/**
 * Gets the minimum and maximum charging levels from processed data.
 */
export const getChargingLevelRange = (
  data: ProcessedChargingData[]
): { min: number; max: number } => {
  if (data.length === 0) {
    return { min: 0, max: 100 };
  }

  const levels = data.map(d => d.level);
  const min = Math.max(0, Math.min(...levels) - 5);
  const max = Math.min(100, Math.max(...levels) + 5);

  return { min, max };
};

/**
 * Calculates statistics from charging data.
 */
export const calculateChargingStats = (data: ProcessedChargingData[]) => {
  if (data.length === 0) {
    return {
      currentLevel: 0,
      maxLevel: 0,
      minLevel: 0,
      avgLevel: 0,
      totalCharged: 0,
      totalConsumed: 0,
      chargingPeriods: 0,
      consumptionPeriods: 0,
    };
  }

  const levels = data.map(d => d.level);
  const currentLevel = data[data.length - 1].level;
  const maxLevel = Math.max(...levels);
  const minLevel = Math.min(...levels);
  const avgLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);

  let totalCharged = 0;
  let totalConsumed = 0;
  let chargingPeriods = 0;
  let consumptionPeriods = 0;

  data.forEach(d => {
    if (d.change > 0) {
      totalCharged += d.change;
      chargingPeriods++;
    } else if (d.change < 0) {
      totalConsumed += Math.abs(d.change);
      consumptionPeriods++;
    }
  });

  return {
    currentLevel,
    maxLevel,
    minLevel,
    avgLevel,
    totalCharged,
    totalConsumed,
    chargingPeriods,
    consumptionPeriods,
  };
};

/**
 * Generates accessibility label for a charging data point.
 */
export const getAccessibilityLabel = (data: ProcessedChargingData): string => {
  const date = new Date(data.timestamp);
  const fullDateTime = formatFullDateTime(date);
  const status =
    data.change > 0
      ? `charging, increased by ${data.change} percent`
      : data.change < 0
        ? `consuming energy, decreased by ${Math.abs(data.change)} percent`
        : 'stable, no change';

  return `${fullDateTime}. Battery level ${data.level} percent. ${status}`;
};

/**
 * Generates chart tick values for the x-axis (time).
 * Returns evenly spaced tick values for better readability.
 */
export const generateTimeAxisTicks = (
  data: ProcessedChargingData[],
  maxTicks: number = 6
): number[] => {
  if (data.length <= maxTicks) {
    return data.map(d => d.timestamp);
  }

  const step = Math.ceil(data.length / maxTicks);
  const ticks: number[] = [];

  for (let i = 0; i < data.length; i += step) {
    ticks.push(data[i].timestamp);
  }

  // Always include the last data point
  const lastTimestamp = data[data.length - 1].timestamp;
  if (!ticks.includes(lastTimestamp)) {
    ticks.push(lastTimestamp);
  }

  return ticks;
};
