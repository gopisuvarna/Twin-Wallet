import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

interface BudgetCardProps {
  id: string;
  category?: string | null;
  userName?: string | null;
  amountLimit: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDarkMode?: boolean;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  userName,
  amountLimit,
  spentAmount,
  remainingAmount,
  percentageUsed,
  isExceeded,
  onEdit,
  onDelete,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;

  const barColor = isExceeded
    ? colors.expense
    : percentageUsed > 85
    ? '#F59E0B'
    : colors.primary;

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Budget',
      `Delete budget limit for ${category || 'Overall'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
              {category || 'Overall Budget'}
            </Text>

            {/* Scope Badge (Joint vs Individual) */}
            <View style={[styles.scopeBadge, { backgroundColor: userName ? colors.incomeBg : colors.surfaceVariant }]}>
              <Text style={[styles.scopeText, { color: userName ? colors.income : colors.textSecondary }]}>
                {userName ? `👤 ${userName}` : '👥 Joint Wallet'}
              </Text>
            </View>
          </View>

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

        <View style={styles.actionRow}>
          {onEdit ? (
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <Text style={styles.actionIcon}>✏️ Edit</Text>
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity onPress={handleDeletePress} style={styles.actionBtn}>
              <Text style={styles.actionIcon}>🗑️ Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scopeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scopeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    marginTop: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
});
