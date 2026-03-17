/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock victory-native
jest.mock('victory-native', () => ({
  VictoryChart: ({ children }) => children,
  VictoryLine: () => null,
  VictoryAxis: () => null,
  VictoryArea: () => null,
  VictoryTheme: { material: {} },
  VictoryTooltip: () => null,
  VictoryVoronoiContainer: () => null,
  VictoryScatter: () => null,
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Silence console.error for act() warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
