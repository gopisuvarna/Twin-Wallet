import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { analyticsApi } from '../../api/analyticsApi';
import { MonthHeader } from '../../components/common/MonthHeader';
import { CategoryPieChart } from '../../components/analytics/CategoryPieChart';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

export const AnalyticsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'individual' | 'joint'>('individual');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboardAnalytics(selectedYear, selectedMonth);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Financial Analytics</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Category-wise spending pie charts per person & joint
      </Text>

      {/* Month Navigation Header */}
      <MonthHeader onMonthChanged={fetchAnalytics} />

      {/* View Selector Toggle (Individual vs Joint) */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surfaceVariant }]}>
        <TouchableOpacity
          onPress={() => setViewMode('individual')}
          style={[
            styles.toggleBtn,
            viewMode === 'individual' && { backgroundColor: colors.primary },
          ]}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'individual' ? '#FFF' : colors.textPrimary }]}>
            👤 Individual Charts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode('joint')}
          style={[
            styles.toggleBtn,
            viewMode === 'joint' && { backgroundColor: colors.primary },
          ]}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'joint' ? '#FFF' : colors.textPrimary }]}>
            👥 Joint Wallet Chart
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : analytics ? (
        <>
          {/* Key Metrics Grid */}
          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Highest Expense</Text>
              <Text style={[styles.cardValue, { color: colors.expense }]}>{formatINR(analytics.highest_expense)}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Average Expense</Text>
              <Text style={[styles.cardValue, { color: colors.primary }]}>{formatINR(analytics.average_expense)}</Text>
            </View>
          </View>

          {/* Render Charts according to Selected View Mode */}
          {viewMode === 'individual' ? (
            analytics.partner_analytics?.map((partner: any) => (
              <CategoryPieChart
                key={partner.user_id}
                data={partner.category_breakdown || []}
                totalAmount={partner.expense}
                userName={partner.user_name}
                colors={colors}
              />
            ))
          ) : (
            <CategoryPieChart
              data={analytics.category_breakdown || []}
              totalAmount={analytics.total_expense}
              userName="Joint Wallet"
              colors={colors}
            />
          )}
        </>
      ) : null}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  toggleRow: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
});
