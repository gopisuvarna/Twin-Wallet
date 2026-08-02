import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { transactionApi } from '../../api/transactionApi';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { MonthHeader } from '../../components/common/MonthHeader';
import { darkColors, lightColors } from '../../theme/colors';

export const TransactionsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
});
