import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryArea,
  VictoryScatter,
  VictoryTheme,
  VictoryVoronoiContainer,
} from 'victory-native';
import { ProcessedChargingData, Colors, Typography, Spacing, BorderRadius } from '../../types';
import { getChargingLevelRange, generateTimeAxisTicks, formatTime } from '../../utils';

interface ChargingChartProps {
  /** Charging data to visualize */
  data: ProcessedChargingData[];
  /** Chart height */
  height?: number;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Custom accessibility label */
  accessibilityLabel?: string;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Interactive line chart showing battery charging levels over time.
 * Uses Victory Native for cross-platform chart rendering.
 * Optimized for performance with memoized calculations.
 */
export const ChargingChart: React.FC<ChargingChartProps> = ({
  data,
  height = 280,
  showGrid = true,
  accessibilityLabel,
}) => {
  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return data.map(d => ({
      x: d.timestamp,
      y: d.level,
    }));
  }, [data]);

  // Memoize axis configuration
  const { yDomain, xTicks } = useMemo(() => {
    const range = getChargingLevelRange(data);
    const ticks = generateTimeAxisTicks(data, 5);
    return {
      yDomain: [range.min, range.max] as [number, number],
      xTicks: ticks,
    };
  }, [data]);

  // Format x-axis labels
  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return formatTime(date);
  };

  // Calculate chart width based on screen
  const chartWidth = screenWidth - Spacing.lg * 2;

  if (data.length === 0) {
    return (
      <View
        style={[styles.container, { height }]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="No charging data available to display"
      >
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  const defaultAccessibilityLabel = `Battery level chart showing ${data.length} data points over 24 hours. Levels range from ${yDomain[0]} to ${yDomain[1]} percent.`;

  return (
    <View
      style={[styles.container, { height }]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
    >
      {/* Chart Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Battery Level (24h)</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.chartLine }]} />
            <Text style={styles.legendText}>Charge Level</Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <VictoryChart
          width={chartWidth}
          height={height - 60}
          padding={{ left: 45, right: 20, top: 20, bottom: 40 }}
          theme={VictoryTheme.material}
          domainPadding={{ x: 10, y: 10 }}
          domain={{ y: yDomain }}
          containerComponent={
            <VictoryVoronoiContainer voronoiDimension="x" labels={({ datum }) => `${datum.y}%`} />
          }
        >
          {/* Grid lines */}
          {showGrid && (
            <VictoryAxis
              dependentAxis
              style={{
                grid: { stroke: Colors.chartGrid, strokeDasharray: '4, 4' },
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: { fill: 'transparent' },
              }}
            />
          )}

          {/* Y-Axis */}
          <VictoryAxis
            dependentAxis
            tickFormat={tick => `${tick}%`}
            style={{
              axis: { stroke: Colors.chartAxis },
              ticks: { stroke: Colors.chartAxis, size: 5 },
              tickLabels: {
                fill: Colors.textSecondary,
                fontSize: Typography.fontSizes.xs,
                fontFamily: 'System',
              },
              grid: { stroke: 'transparent' },
            }}
          />

          {/* X-Axis */}
          <VictoryAxis
            tickValues={xTicks}
            tickFormat={formatXAxisLabel}
            style={{
              axis: { stroke: Colors.chartAxis },
              ticks: { stroke: Colors.chartAxis, size: 5 },
              tickLabels: {
                fill: Colors.textSecondary,
                fontSize: Typography.fontSizes.xs,
                fontFamily: 'System',
                angle: -45,
                textAnchor: 'end',
              },
              grid: { stroke: 'transparent' },
            }}
          />

          {/* Area fill under the line */}
          <VictoryArea
            data={chartData}
            interpolation="monotoneX"
            style={{
              data: {
                fill: Colors.chartFill,
                stroke: 'transparent',
              },
            }}
          />

          {/* Main line */}
          <VictoryLine
            data={chartData}
            interpolation="monotoneX"
            style={{
              data: {
                stroke: Colors.chartLine,
                strokeWidth: 2.5,
              },
            }}
          />

          {/* Data points */}
          <VictoryScatter
            data={chartData}
            size={4}
            style={{
              data: {
                fill: Colors.chartLine,
                stroke: Colors.surface,
                strokeWidth: 1.5,
              },
            }}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  chartWrapper: {
    marginLeft: -Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});
