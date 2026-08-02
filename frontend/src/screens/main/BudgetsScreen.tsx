import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { budgetApi, BudgetResponseData } from '../../api/budgetApi';
import { BudgetCard } from '../../components/budget/BudgetCard';
import { MonthHeader } from '../../components/common/MonthHeader';
import { darkColors, lightColors } from '../../theme/colors';

const CATEGORIES = [
  'Overall Budget',
  'Rent',
  'Food',
  'Shopping',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Misc',
];

export const BudgetsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [budgets, setBudgets] = useState<BudgetResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Overall Budget');
  const [amountLimit, setAmountLimit] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getBudgets(selectedYear, selectedMonth);
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedYear, selectedMonth]);

  const handleSaveBudget = async () => {
    const numericLimit = parseFloat(amountLimit);
    if (!numericLimit || numericLimit <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await budgetApi.createOrUpdateBudget({
        category: selectedCategory === 'Overall Budget' ? undefined : selectedCategory,
        amount_limit: numericLimit,
        year: selectedYear,
        month: selectedMonth,
      });

      Alert.alert('Success', 'Budget limit updated successfully!');
      setModalVisible(false);
      setAmountLimit('');
      fetchBudgets();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to save budget limit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Category Budgets</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Set & track monthly spending caps</Text>

      {/* Month Navigation */}
      <MonthHeader onMonthChanged={fetchBudgets} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {budgets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No budgets set for this month yet.
              </Text>
            </View>
          ) : (
            budgets.map((b) => (
              <BudgetCard
                key={b.id}
                category={b.category}
                amountLimit={b.amount_limit}
                spentAmount={b.spent_amount}
                remainingAmount={b.remaining_amount}
                percentageUsed={b.percentage_used}
                isExceeded={b.is_exceeded}
                isDarkMode={isDarkMode}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Floating Add/Set Budget Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add / Edit Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Set Category Cap</Text>

            {/* Category Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor:
                        selectedCategory === cat ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: selectedCategory === cat ? '#FFF' : colors.textPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Amount Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Monthly Limit (₹)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
              ]}
              placeholder="e.g. 15000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amountLimit}
              onChangeText={setAmountLimit}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveBudget}
                disabled={submitting}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save Budget</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '400',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
