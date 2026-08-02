import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSummary, setExpenses, setLoading } from '../../store/walletSlice';
import { ledgerApi } from '../../api/ledgerApi';
import { transactionApi } from '../../api/transactionApi';
import { BalanceCard } from '../../components/common/BalanceCard';
import { PartnerComparisonCard } from '../../components/analytics/PartnerComparisonCard';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { MonthHeader } from '../../components/common/MonthHeader';
import { darkColors, lightColors } from '../../theme/colors';

export const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedYear, selectedMonth, summary, expenses, isLoading } = useSelector(
    (state: RootState) => state.wallet
  );
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const fetchDashboardData = async () => {
    dispatch(setLoading(true));
    try {
      const summaryRes = await ledgerApi.getSummary(selectedYear, selectedMonth);
      dispatch(setSummary(summaryRes.data));

      const expRes = await transactionApi.listExpenses({ year: selectedYear, month: selectedMonth });
      dispatch(setExpenses(expRes.data));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.full_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase() || 'U'}</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation Control */}
      <MonthHeader onMonthChanged={fetchDashboardData} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />}
      >
        {/* Financial Summary Balance Card */}
        {summary ? (
          <BalanceCard
            openingBalance={summary.opening_balance}
            income={summary.total_income}
            expense={summary.total_expense}
            closingBalance={summary.closing_balance}
            savingsRate={summary.savings_rate}
            averageDailyExpense={summary.average_daily_expense}
            isDarkMode={isDarkMode}
          />
        ) : null}

        {/* Partner Comparison Breakdown (Real names enforced) */}
        {summary?.partner_contributions ? (
          <PartnerComparisonCard
            contributions={summary.partner_contributions}
            isDarkMode={isDarkMode}
          />
        ) : null}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {expenses.slice(0, 5).map((item) => (
          <TransactionItem
            key={item.id}
            id={item.id}
            type="expense"
            title={item.category || 'Expense'}
            amount={item.amount}
            userName={item.user?.full_name}
            date={item.transaction_date}
            description={item.description}
            isDarkMode={isDarkMode}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddTransaction')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
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
});
