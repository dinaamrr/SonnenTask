import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BatteryDashboardScreen } from './src/screens';

/**
 * Root application component.
 * Wraps the app with necessary providers.
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <BatteryDashboardScreen />
    </SafeAreaProvider>
  );
};

export default App;
