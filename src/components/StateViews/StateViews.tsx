import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../types';

interface LoadingStateProps {
  /** Loading message */
  message?: string;
}

/**
 * Loading state component with spinner.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading charging data...',
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Callback for retry action */
  onRetry?: () => void;
}

/**
 * Error state component with retry button.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${message}`}
    >
      <Text
        style={styles.errorIcon}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        ⚠️
      </Text>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry loading data"
          accessibilityHint="Double tap to try loading the data again"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyStateProps {
  /** Title for empty state */
  title?: string;
  /** Description for empty state */
  description?: string;
}

/**
 * Empty state component when no data is available.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is no charging data to display for the last 24 hours.',
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description}`}
    >
      <Text
        style={styles.emptyIcon}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        📊
      </Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    minWidth: 150,
    alignItems: 'center',
  },
  retryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
