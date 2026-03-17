import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../types';

interface BatteryLevelIndicatorProps {
  /** Current battery level (0-100) */
  level: number;
  /** Whether the battery is currently charging */
  isCharging?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Custom accessibility label */
  accessibilityLabel?: string;
}

/**
 * Visual battery level indicator component.
 * Displays a battery icon with fill level and optional percentage.
 * Accessible and works on both iOS and Android.
 */
export const BatteryLevelIndicator: React.FC<BatteryLevelIndicatorProps> = ({
  level,
  isCharging = false,
  size = 'medium',
  showLabel = true,
  accessibilityLabel,
}) => {
  // Clamp level between 0 and 100
  const clampedLevel = Math.max(0, Math.min(100, level));

  const dimensions = {
    small: { width: 40, height: 20, tipWidth: 4 },
    medium: { width: 60, height: 28, tipWidth: 5 },
    large: { width: 80, height: 36, tipWidth: 6 },
  }[size];

  const fontSize = {
    small: Typography.fontSizes.xs,
    medium: Typography.fontSizes.sm,
    large: Typography.fontSizes.md,
  }[size];

  // Determine fill color based on level and charging state
  const getFillColor = () => {
    if (isCharging) return Colors.charging;
    if (clampedLevel <= 20) return Colors.consuming;
    if (clampedLevel <= 40) return '#FFA000'; // Amber for low
    return Colors.charging;
  };

  // Accessibility
  const defaultAccessibilityLabel = `Battery level ${clampedLevel} percent${
    isCharging ? ', currently charging' : ''
  }`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clampedLevel,
        text: `${clampedLevel}%`,
      }}
    >
      <View
        style={[
          styles.batteryBody,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
        ]}
      >
        {/* Battery fill */}
        <View
          style={[
            styles.batteryFill,
            {
              width: `${clampedLevel}%`,
              backgroundColor: getFillColor(),
            },
          ]}
        />

        {/* Charging indicator */}
        {isCharging && (
          <View style={styles.chargingIconContainer}>
            <Text
              style={[styles.chargingIcon, { fontSize: dimensions.height * 0.6 }]}
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
            >
              ⚡
            </Text>
          </View>
        )}
      </View>

      {/* Battery tip */}
      <View
        style={[
          styles.batteryTip,
          {
            width: dimensions.tipWidth,
            height: dimensions.height * 0.4,
          },
        ]}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      />

      {/* Percentage label */}
      {showLabel && (
        <Text
          style={[styles.label, { fontSize }]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          {clampedLevel}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceVariant,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  batteryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BorderRadius.sm - 2,
  },
  batteryTip: {
    backgroundColor: Colors.textPrimary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginLeft: 1,
  },
  chargingIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargingIcon: {
    color: Colors.textOnPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
});
