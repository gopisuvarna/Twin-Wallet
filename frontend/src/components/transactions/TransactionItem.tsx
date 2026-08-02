import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { darkColors, lightColors } from '../../theme/colors';

interface TransactionItemProps {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  userName: string;
  date: string;
  description?: string;
  onPress?: () => void;
  onDelete?: () => void;
  isDarkMode?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  type,
  title,
  amount,
  userName,
  date,
  description,
  onPress,
  onDelete,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;
  const isIncome = type === 'income';

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${type} of ${formatINR(amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg },
        ]}
      >
        <Text style={[styles.iconText, { color: isIncome ? colors.income : colors.expense }]}>
          {isIncome ? '↓' : '↑'}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          Logged by <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{userName}</Text> • {formatDate(date)}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.income : colors.expense },
          ]}
        >
          {isIncome ? '+' : '-'}{formatINR(amount)}
        </Text>

        {onDelete ? (
          <TouchableOpacity onPress={handleDeletePress} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    fontSize: 11,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteBtn: {
    marginTop: 4,
    padding: 2,
  },
  deleteIcon: {
    fontSize: 14,
  },
});
