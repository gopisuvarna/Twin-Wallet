import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

interface BalanceCardProps {
  openingBalance: number;
  income: number;
  expense: number;
  closingBalance: number;
  savingsRate: number;
  averageDailyExpense: number;
  isDarkMode?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  openingBalance,
  income,
  expense,
  closingBalance,
  savingsRate,
  averageDailyExpense,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>CLOSING BALANCE (SAVINGS)</Text>
      <Text style={[styles.mainBalance, { color: colors.primary }]}>{formatINR(closingBalance, true)}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Opening</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatINR(openingBalance)}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Income (+)</Text>
          <Text style={[styles.metricValue, { color: colors.income }]}>{formatINR(income)}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Expense (-)</Text>
          <Text style={[styles.metricValue, { color: colors.expense }]}>{formatINR(expense)}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={[styles.statTitle, { color: colors.textMuted }]}>Savings Rate</Text>
          <Text style={[styles.statNumber, { color: colors.income }]}>{savingsRate.toFixed(1)}%</Text>
        </View>

        <View style={styles.statBadge}>
          <Text style={[styles.statTitle, { color: colors.textMuted }]}>Avg Daily Expense</Text>
          <Text style={[styles.statNumber, { color: colors.expense }]}>{formatINR(averageDailyExpense)}/day</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mainBalance: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBadge: {
    flex: 1,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});
