import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { transactionApi } from '../../api/transactionApi';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { MonthHeader } from '../../components/common/MonthHeader';
import { darkColors, lightColors } from '../../theme/colors';

const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Travel', 'Medical', 'Rent', 'Fuel', 'Bills',
  'Entertainment', 'Education', 'Insurance', 'Utilities', 'Others',
];

const INCOME_SOURCES = [
  'Salary', 'Bonus', 'Gift', 'Freelancing', 'Business', 'Investment', 'Cashback', 'Other',
];

export const TransactionsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategorySource, setEditCategorySource] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const expRes = await transactionApi.listExpenses({ year: selectedYear, month: selectedMonth });
      const incRes = await transactionApi.listIncomes({ year: selectedYear, month: selectedMonth });

      const mappedExp = expRes.data.map((i: any) => ({ ...i, type: 'expense', title: i.category }));
      const mappedInc = incRes.data.map((i: any) => ({ ...i, type: 'income', title: i.source }));

      const combined = [...mappedExp, ...mappedInc].sort(
        (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );

      setTransactions(combined);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setEditAmount(item.amount.toString());
    setEditCategorySource(item.title);
    setEditDescription(item.description || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const numAmount = parseFloat(editAmount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem.type === 'expense') {
        await transactionApi.updateExpense(editingItem.id, {
          amount: numAmount,
          category: editCategorySource,
          description: editDescription,
        });
      } else {
        await transactionApi.updateIncome(editingItem.id, {
          amount: numAmount,
          source: editCategorySource,
          description: editDescription,
        });
      }

      Alert.alert('Success', `${editingItem.type === 'expense' ? 'Expense' : 'Income'} updated successfully!`);
      setEditModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      if (type === 'expense') {
        await transactionApi.deleteExpense(id);
      } else {
        await transactionApi.deleteIncome(id);
      }
      Alert.alert('Deleted', 'Transaction deleted successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete transaction.');
    }
  };

  const filteredData = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title?.toLowerCase().includes(q);
      const userMatch = t.user?.full_name?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      return titleMatch || userMatch || descMatch;
    }
    return true;
  });

  const categoriesOrSources = editingItem?.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Transactions</Text>

      {/* Month Navigation */}
      <MonthHeader onMonthChanged={loadData} />

      {/* Search Input */}
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search category, description or partner..."
        placeholderTextColor={colors.textMuted}
        style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'expense', 'income'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilterType(type)}
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              filterType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterType === type ? '#FFF' : colors.textPrimary },
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            id={item.id}
            type={item.type}
            title={item.title}
            amount={item.amount}
            userName={item.user?.full_name}
            date={item.transaction_date}
            description={item.description}
            onPress={() => handleOpenEditModal(item)}
            onDelete={() => handleDeleteTransaction(item.id, item.type)}
            isDarkMode={isDarkMode}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>
            No transactions found for this period.
          </Text>
        }
      />

      {/* Edit Transaction Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />

          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Edit {editingItem?.type === 'expense' ? 'Expense' : 'Income'}
              </Text>

              {/* Category / Source Selector */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {editingItem?.type === 'expense' ? 'Category' : 'Source'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {categoriesOrSources.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setEditCategorySource(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          editCategorySource === cat ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: editCategorySource === cat ? '#FFF' : colors.textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Amount Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount (₹)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                value={editAmount}
                onChangeText={setEditAmount}
              />

              {/* Description Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="Add notes..."
                placeholderTextColor={colors.textMuted}
                value={editDescription}
                onChangeText={setEditDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveEdit}
                  disabled={submitting}
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Update</Text>
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
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  searchInput: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
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
