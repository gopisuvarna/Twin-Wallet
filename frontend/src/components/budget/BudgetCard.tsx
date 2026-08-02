import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

interface BudgetCardProps {
  category?: string | null;
  amountLimit: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  isDarkMode?: boolean;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  amountLimit,
  spentAmount,
  remainingAmount,
  percentageUsed,
  isExceeded,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;

  const barColor = isExceeded
    ? colors.expense
    : percentageUsed > 85
    ? '#F59E0B'
    : colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
            {category || 'Overall Monthly Budget'}
          </Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Spent {formatINR(spentAmount)} of {formatINR(amountLimit)}
          </Text>
        </View>

        {isExceeded ? (
          <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.badgeText, { color: colors.expense }]}>Exceeded!</Text>
          </View>
        ) : (
          <Text style={[styles.remainingText, { color: colors.income }]}>
            {formatINR(remainingAmount)} left
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, percentageUsed)}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.pctText, { color: colors.textMuted }]}>
          {percentageUsed.toFixed(1)}% Used
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  remainingText: {
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
