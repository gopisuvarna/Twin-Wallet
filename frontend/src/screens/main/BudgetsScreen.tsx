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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { budgetApi, BudgetResponseData } from '../../api/budgetApi';
import { ledgerApi } from '../../api/ledgerApi';
import { BudgetCard } from '../../components/budget/BudgetCard';
import { MonthHeader } from '../../components/common/MonthHeader';
import { darkColors, lightColors } from '../../theme/colors';

const CATEGORIES = [
  'Overall Budget',
  'Food',
  'Shopping',
  'Travel',
  'Medical',
  'Rent',
  'Fuel',
  'Bills',
  'Entertainment',
  'Education',
  'Utilities',
  'Others',
];

export const BudgetsScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedYear, selectedMonth, summary } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [budgets, setBudgets] = useState<BudgetResponseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetScope, setBudgetScope] = useState<'joint' | 'individual'>('joint');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Overall Budget');
  const [amountLimit, setAmountLimit] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const partnerList = summary?.partner_contributions || [];

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

  const handleOpenAddModal = () => {
    setEditingBudgetId(null);
    setBudgetScope('joint');
    setSelectedUserId(null);
    setSelectedCategory('Overall Budget');
    setAmountLimit('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (b: BudgetResponseData) => {
    setEditingBudgetId(b.id);
    setBudgetScope(b.user_id ? 'individual' : 'joint');
    setSelectedUserId(b.user_id || null);
    setSelectedCategory(b.category || 'Overall Budget');
    setAmountLimit(b.amount_limit.toString());
    setModalVisible(true);
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetApi.deleteBudget(id);
      Alert.alert('Deleted', 'Budget limit deleted successfully.');
      fetchBudgets();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete budget.');
    }
  };

  const handleSaveBudget = async () => {
    const numericLimit = parseFloat(amountLimit);
    if (!numericLimit || numericLimit <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount greater than 0.');
      return;
    }

    if (budgetScope === 'individual' && !selectedUserId) {
      Alert.alert('Select Person', 'Please select which partner this budget belongs to.');
      return;
    }

    setSubmitting(true);
    try {
      const payloadUser = budgetScope === 'individual' ? selectedUserId : null;
      const payloadCategory = selectedCategory === 'Overall Budget' ? null : selectedCategory;

      if (editingBudgetId) {
        await budgetApi.updateBudget(editingBudgetId, {
          user_id: payloadUser,
          category: payloadCategory,
          amount_limit: numericLimit,
        });
        Alert.alert('Updated', 'Budget limit updated successfully!');
      } else {
        await budgetApi.createOrUpdateBudget({
          user_id: payloadUser,
          category: payloadCategory,
          amount_limit: numericLimit,
          year: selectedYear,
          month: selectedMonth,
        });
        Alert.alert('Created', 'Budget cap created successfully!');
      }

      setModalVisible(false);
      fetchBudgets();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to save budget.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Category Budgets</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Set joint or individual monthly spending caps
      </Text>

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
                id={b.id}
                category={b.category}
                userName={b.user_name}
                amountLimit={b.amount_limit}
                spentAmount={b.spent_amount}
                remainingAmount={b.remaining_amount}
                percentageUsed={b.percentage_used}
                isExceeded={b.is_exceeded}
                onEdit={() => handleOpenEditModal(b)}
                onDelete={() => handleDeleteBudget(b.id)}
                isDarkMode={isDarkMode}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Floating Add/Set Budget Button */}
      <TouchableOpacity
        onPress={handleOpenAddModal}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add / Edit Budget Modal with Keyboard Overlapping Fix */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingBudgetId ? 'Edit Budget Cap' : 'New Spending Cap'}
              </Text>

              {/* 1. Budget Scope Picker (Joint vs Individual) */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Budget Type</Text>
              <View style={styles.scopeRow}>
                <TouchableOpacity
                  onPress={() => {
                    setBudgetScope('joint');
                    setSelectedUserId(null);
                  }}
                  style={[
                    styles.scopeChip,
                    { backgroundColor: budgetScope === 'joint' ? colors.primary : colors.surfaceVariant },
                  ]}
                >
                  <Text style={[styles.scopeChipText, { color: budgetScope === 'joint' ? '#FFF' : colors.textPrimary }]}>
                    👥 Joint Wallet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setBudgetScope('individual')}
                  style={[
                    styles.scopeChip,
                    { backgroundColor: budgetScope === 'individual' ? colors.primary : colors.surfaceVariant },
                  ]}
                >
                  <Text style={[styles.scopeChipText, { color: budgetScope === 'individual' ? '#FFF' : colors.textPrimary }]}>
                    👤 Individual Person
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Individual Person Selector if scope === 'individual' */}
              {budgetScope === 'individual' ? (
                <View style={{ marginBottom: 14 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Select Partner</Text>
                  <View style={styles.partnerRow}>
                    {partnerList.map((p) => (
                      <TouchableOpacity
                        key={p.user_id}
                        onPress={() => setSelectedUserId(p.user_id)}
                        style={[
                          styles.partnerChip,
                          {
                            backgroundColor:
                              selectedUserId === p.user_id ? colors.primary : colors.surfaceVariant,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.partnerChipText,
                            { color: selectedUserId === p.user_id ? '#FFF' : colors.textPrimary },
                          ]}
                        >
                          {p.user_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* 2. Category Selector */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
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

              {/* 3. Monthly Limit Amount Input */}
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
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>
                      {editingBudgetId ? 'Update Budget' : 'Save Budget'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  scopeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  partnerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  partnerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  partnerChipText: {
    fontSize: 13,
    fontWeight: '700',
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
    marginTop: 10,
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
