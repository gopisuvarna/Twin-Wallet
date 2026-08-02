import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

interface SavingsGoalCardProps {
  goalName: string;
  targetAmount: number;
  currentProgress: number;
  completionPercentage: number;
  targetDate?: string | null;
  isCompleted: boolean;
  isDarkMode?: boolean;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goalName,
  targetAmount,
  currentProgress,
  completionPercentage,
  targetDate,
  isCompleted,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{goalName}</Text>
          {targetDate ? (
            <Text style={[styles.targetDateText, { color: colors.textSecondary }]}>
              Target: {targetDate}
            </Text>
          ) : null}
        </View>

        {isCompleted ? (
          <View style={[styles.completedBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.completedBadgeText, { color: colors.income }]}>🎉 Goal Reached!</Text>
          </View>
        ) : (
          <Text style={[styles.amountText, { color: colors.primary }]}>
            {formatINR(currentProgress)} / {formatINR(targetAmount)}
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, completionPercentage)}%`,
              backgroundColor: isCompleted ? colors.income : colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.pctText, { color: colors.textMuted }]}>
          {completionPercentage.toFixed(1)}% Achieved
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  targetDateText: {
    fontSize: 12,
    marginTop: 2,
  },
  completedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
