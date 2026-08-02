import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { analyticsApi } from '../../api/analyticsApi';
import { reportApi } from '../../api/reportApi';
import { MonthHeader } from '../../components/common/MonthHeader';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

export const AnalyticsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

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

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await reportApi.exportPdf(selectedYear, selectedMonth);
      if (res.data) {
        Alert.alert(
          'PDF Report Ready',
          `Monthly PDF financial statement for ${selectedMonth}/${selectedYear} generated successfully!`
        );
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Failed to generate PDF report.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const res = await reportApi.exportCsv(selectedYear, selectedMonth);
      if (res.data) {
        Alert.alert(
          'CSV Ledger Exported',
          `Raw transaction ledger CSV data for ${selectedMonth}/${selectedYear} exported successfully!`
        );
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Failed to export CSV ledger.');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Financial Analytics</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>In-depth spending & savings insights</Text>

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

          {/* Category Breakdown */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>

            {analytics.top_category ? (
              <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
                Top Spending: <Text style={{ color: colors.expense, fontWeight: '700' }}>{analytics.top_category}</Text>
              </Text>
            ) : null}

            {analytics.category_breakdown?.map((cat: any) => (
              <View key={cat.category} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.category}</Text>
                  <Text style={[styles.catAmt, { color: colors.textSecondary }]}>
                    {formatINR(cat.amount)} ({cat.percentage}%)
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={[styles.progressFill, { width: `${cat.percentage}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Export Statements */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Export Reports & Statements</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary, marginBottom: 14 }]}>
              Generate official PDF summary or raw CSV data.
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={exportingPdf}
                style={[styles.exportBtn, { backgroundColor: colors.primary }]}
              >
                {exportingPdf ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.exportBtnText}>📄 PDF Report</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportCsv}
                disabled={exportingCsv}
                style={[styles.exportBtn, { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }]}
              >
                {exportingCsv ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={[styles.exportBtnText, { color: colors.textPrimary }]}>📊 CSV Export</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
    fontWeight: '700',
    marginBottom: 10,
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
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
