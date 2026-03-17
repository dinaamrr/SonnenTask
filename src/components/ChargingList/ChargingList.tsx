import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { ProcessedChargingData, Colors, Typography, Spacing, BorderRadius } from '../../types';
import { getAccessibilityLabel } from '../../utils';

interface ChargingListProps {
  /** Charging data to display */
  data: ProcessedChargingData[];
  /** Maximum number of items to show initially */
  initialNumToRender?: number;
  /** Custom accessibility label for the list */
  accessibilityLabel?: string;
}

interface ChargingListItemProps {
  item: ProcessedChargingData;
  index: number;
}

/**
 * Individual list item component.
 * Memoized to prevent unnecessary re-renders.
 */
const ChargingListItem = memo<ChargingListItemProps>(({ item, index }) => {
  const isCharging = item.change > 0;
  const isConsuming = item.change < 0;

  const getStatusIcon = () => {
    if (isCharging) return '▲';
    if (isConsuming) return '▼';
    return '●';
  };

  const getStatusColor = () => {
    if (isCharging) return Colors.charging;
    if (isConsuming) return Colors.consuming;
    return Colors.neutral;
  };

  const getStatusText = () => {
    if (isCharging) return `+${item.change}%`;
    if (isConsuming) return `${item.change}%`;
    return 'No change';
  };

  return (
    <View
      style={[styles.listItem, index === 0 && styles.firstItem]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={getAccessibilityLabel(item)}
    >
      {/* Time Column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.timeLabel}</Text>
        <Text style={styles.dateText}>{item.dateLabel}</Text>
      </View>

      {/* Level Column */}
      <View style={styles.levelColumn}>
        <View style={styles.levelBar}>
          <View
            style={[
              styles.levelFill,
              {
                width: `${item.level}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.levelText}>{item.level}%</Text>
      </View>

      {/* Change Column */}
      <View style={styles.changeColumn}>
        <Text
          style={[styles.statusIcon, { color: getStatusColor() }]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          {getStatusIcon()}
        </Text>
        <Text style={[styles.changeText, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>
    </View>
  );
});

ChargingListItem.displayName = 'ChargingListItem';

/**
 * Optimized list component showing charging history.
 * Uses FlatList for efficient rendering of large datasets.
 */
export const ChargingList: React.FC<ChargingListProps> = ({
  data,
  initialNumToRender = 10,
  accessibilityLabel,
}) => {
  // Reverse data to show most recent first
  const reversedData = [...data].reverse();

  // Memoized render function
  const renderItem: ListRenderItem<ProcessedChargingData> = useCallback(
    ({ item, index }) => <ChargingListItem item={item} index={index} />,
    []
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: ProcessedChargingData) => `${item.eventId}-${item.timestamp}`,
    []
  );

  // Item separator
  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // List header
  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Charging History</Text>
        <Text style={styles.headerSubtitle}>{data.length} readings • Last 24 hours</Text>
      </View>
    ),
    [data.length]
  );

  // Empty state
  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>No charging history available</Text>
        <Text style={styles.emptySubtext}>Data will appear once the battery starts reporting</Text>
      </View>
    ),
    []
  );

  const defaultAccessibilityLabel = `Charging history list with ${data.length} entries`;

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View
        style={styles.legend}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel="Legend: Green arrow up means charging, red arrow down means consuming energy, gray dot means no change"
      >
        <View style={styles.legendItem}>
          <Text style={[styles.legendIcon, { color: Colors.charging }]}>▲</Text>
          <Text style={styles.legendText}>Charging</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendIcon, { color: Colors.consuming }]}>▼</Text>
          <Text style={styles.legendText}>Consuming</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendIcon, { color: Colors.neutral }]}>●</Text>
          <Text style={styles.legendText}>Stable</Text>
        </View>
      </View>

      <FlatList
        data={reversedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  legendIcon: {
    fontSize: Typography.fontSizes.sm,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
  },
  firstItem: {
    borderTopWidth: 0,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  timeColumn: {
    width: 70,
  },
  timeText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  levelColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  levelBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  levelFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  levelText: {
    width: 40,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  changeColumn: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusIcon: {
    fontSize: Typography.fontSizes.sm,
    marginRight: Spacing.xs,
  },
  changeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    minWidth: 50,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
