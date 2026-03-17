import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChargingData } from '../hooks';
import {
  ChargingChart,
  ChargingList,
  StatsOverview,
  BatteryLevelIndicator,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components';
import { Colors, Typography, Spacing } from '../types';

/**
 * Main screen displaying battery charging data.
 * Shows chart, statistics, and detailed list of charging events.
 */
export const BatteryDashboardScreen: React.FC = () => {
  const { data, stats, isLoading, isError, isEmpty, error, refresh } = useChargingData();

  // Handle pull-to-refresh
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError && data.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <ErrorState message={error ?? 'An error occurred'} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityRole="scrollbar"
        accessibilityLabel="Battery dashboard scrollable content"
      >
        {/* Header */}
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Battery Monitor</Text>
              <Text style={styles.headerSubtitle}>Last 24 hours</Text>
            </View>
            <BatteryLevelIndicator
              level={stats.currentLevel}
              isCharging={data.length > 0 && data[data.length - 1].change > 0}
              size="medium"
            />
          </View>
        </View>

        {/* Chart Section */}
        <ChargingChart data={data} height={280} />

        {/* Statistics Overview */}
        <StatsOverview
          currentLevel={stats.currentLevel}
          maxLevel={stats.maxLevel}
          minLevel={stats.minLevel}
          totalCharged={stats.totalCharged}
          totalConsumed={stats.totalConsumed}
        />

        {/* Charging List */}
        <View style={styles.listContainer}>
          <ChargingList data={data} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Data updated: {new Date().toLocaleString()}</Text>
          <Text style={styles.footerNote}>Pull down to refresh</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listContainer: {
    height: 400,
    marginBottom: Spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textDisabled,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
