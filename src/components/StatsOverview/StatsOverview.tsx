import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../types';

interface StatCardProps {
  /** Label for the statistic */
  label: string;
  /** Value to display */
  value: string | number;
  /** Optional unit suffix */
  unit?: string;
  /** Icon to display */
  icon?: string;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Custom accessibility label */
  accessibilityLabel?: string;
}

/**
 * Card component for displaying a single statistic.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  variant = 'default',
  accessibilityLabel,
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return Colors.charging;
      case 'warning':
        return '#FFA000';
      case 'error':
        return Colors.consuming;
      default:
        return Colors.primary;
    }
  };

  const defaultA11yLabel = `${label}: ${value}${unit ? ` ${unit}` : ''}`;

  return (
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? defaultA11yLabel}
    >
      {icon && (
        <Text
          style={[styles.icon, { color: getVariantColor() }]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          {icon}
        </Text>
      )}
      <Text style={[styles.value, { color: getVariantColor() }]}>
        {value}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

interface StatsOverviewProps {
  /** Current battery level */
  currentLevel: number;
  /** Maximum level in the period */
  maxLevel: number;
  /** Minimum level in the period */
  minLevel: number;
  /** Total energy charged */
  totalCharged: number;
  /** Total energy consumed */
  totalConsumed: number;
}

/**
 * Overview component showing key battery statistics.
 */
export const StatsOverview: React.FC<StatsOverviewProps> = ({
  currentLevel,
  maxLevel,
  minLevel,
  totalCharged,
  totalConsumed,
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Battery statistics overview. Current level ${currentLevel} percent, maximum ${maxLevel} percent, minimum ${minLevel} percent, total charged ${totalCharged} percent, total consumed ${totalConsumed} percent.`}
    >
      <Text style={styles.sectionTitle}>Statistics Overview</Text>

      <View style={styles.row}>
        <StatCard
          label="Current"
          value={currentLevel}
          unit="%"
          icon="🔋"
          variant={currentLevel > 50 ? 'success' : currentLevel > 20 ? 'warning' : 'error'}
        />
        <StatCard label="Peak" value={maxLevel} unit="%" icon="📈" variant="success" />
        <StatCard label="Low" value={minLevel} unit="%" icon="📉" variant="warning" />
      </View>

      <View style={styles.row}>
        <StatCard label="Charged" value={`+${totalCharged}`} unit="%" icon="⚡" variant="success" />
        <StatCard label="Consumed" value={`-${totalConsumed}`} unit="%" icon="🔌" variant="error" />
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
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  unit: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
  },
  label: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
