import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { analyticsApi } from '../../api/analyticsApi';
import { MonthHeader } from '../../components/common/MonthHeader';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

const CATEGORY_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'
];

export const AnalyticsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Individual partner category breakdown</Text>

      {/* Month Picker Header */}
      <MonthHeader onMonthChanged={fetchAnalytics} />

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

          {/* Individual Person Category Breakdown Charts for Partner 1 & Partner 2 */}
          {analytics.partner_analytics?.map((partner: any) => (
            <View key={partner.user_id} style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.partnerHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  👤 {partner.user_name}'s Spending
                </Text>
                <Text style={[styles.partnerTotalExp, { color: colors.expense }]}>
                  Total: {formatINR(partner.expense)}
                </Text>
              </View>

              {!partner.category_breakdown || partner.category_breakdown.length === 0 ? (
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>No individual expenses logged for this month.</Text>
              ) : (
                <View style={{ marginTop: 12 }}>
                  {partner.category_breakdown.map((cat: any, idx: number) => {
                    const barColor = CATEGORY_COLORS[(idx + 2) % CATEGORY_COLORS.length];
                    return (
                      <View key={cat.category} style={styles.catRow}>
                        <View style={styles.catHeader}>
                          <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.category}</Text>
                          <Text style={[styles.catAmt, { color: colors.textSecondary }]}>
                            {formatINR(cat.amount)} ({cat.percentage}%)
                          </Text>
                        </View>
                        <View style={[styles.progressBg, { backgroundColor: colors.surfaceVariant }]}>
                          <View style={[styles.progressFill, { width: `${cat.percentage}%`, backgroundColor: barColor }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
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
  sectionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerTotalExp: {
    fontSize: 13,
    fontWeight: '800',
  },
  catRow: {
    marginBottom: 12,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catAmt: {
    fontSize: 12,
  },
  progressBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
