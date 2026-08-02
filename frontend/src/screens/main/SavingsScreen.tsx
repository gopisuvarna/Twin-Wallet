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
import { savingsApi, SavingsGoalResponseData, SavingsOverviewResponseData } from '../../api/savingsApi';
import { SavingsGoalCard } from '../../components/savings/SavingsGoalCard';
import { MonthHeader } from '../../components/common/MonthHeader';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

export const SavingsScreen = () => {
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [goals, setGoals] = useState<SavingsGoalResponseData[]>([]);
  const [overview, setOverview] = useState<SavingsOverviewResponseData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Goal Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSavingsData = async () => {
    setLoading(true);
    try {
      const [goalsRes, overviewRes] = await Promise.all([
        savingsApi.getSavingsGoals(),
        savingsApi.getSavingsOverview(selectedYear, selectedMonth),
      ]);
      setGoals(goalsRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Failed to fetch savings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, [selectedYear, selectedMonth]);

  const handleCreateGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Required Field', 'Please enter a goal title (e.g. Emergency Fund).');
      return;
    }

    const numericAmount = parseFloat(targetAmount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target amount.');
      return;
    }

    setSubmitting(true);
    try {
      await savingsApi.createSavingsGoal({
        goal_name: goalName,
        target_amount: numericAmount,
        target_date: targetDate.trim() || undefined,
      });

      Alert.alert('Goal Created', 'New joint savings goal created successfully!');
      setModalVisible(false);
      setGoalName('');
      setTargetAmount('');
      setTargetDate('');
      fetchSavingsData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to create savings goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await savingsApi.deleteSavingsGoal(id);
      Alert.alert('Deleted', 'Savings goal deleted successfully.');
      fetchSavingsData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete goal.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Savings Hub</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Individual monthly savings & joint targets
      </Text>

      {/* Month Navigation */}
      <MonthHeader onMonthChanged={fetchSavingsData} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Monthly Savings Overview Card */}
          {overview ? (
            <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.overviewHeader}>
                <Text style={[styles.overviewTitle, { color: colors.textPrimary }]}>
                  Monthly Savings Overview
                </Text>
                <Text style={[styles.combinedBadge, { color: colors.income, backgroundColor: colors.incomeBg }]}>
                  + {formatINR(overview.combined_monthly_savings)} Joint
                </Text>
              </View>

              <Text style={[styles.lifetimeText, { color: colors.textSecondary }]}>
                Accumulated Joint Pool: <Text style={{ color: colors.primary, fontWeight: '800' }}>{formatINR(overview.combined_lifetime_savings)}</Text>
              </Text>

              {/* Individual Partner Breakdown */}
              <View style={styles.partnerList}>
                {overview.partner_savings?.map((p) => (
                  <View key={p.user_id} style={[styles.partnerRow, { backgroundColor: colors.surfaceVariant }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.partnerName, { color: colors.textPrimary }]}>
                        👤 {p.user_name}
                      </Text>
                      <Text style={[styles.partnerSub, { color: colors.textSecondary }]}>
                        Income {formatINR(p.monthly_income)} • Exp {formatINR(p.monthly_expense)}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.partnerSavingsAmt,
                          { color: p.monthly_savings >= 0 ? colors.income : colors.expense },
                        ]}
                      >
                        {p.monthly_savings >= 0 ? '+' : ''}{formatINR(p.monthly_savings)}
                      </Text>
                      <Text style={[styles.partnerLifetimeText, { color: colors.textMuted }]}>
                        Lifetime: {formatINR(p.lifetime_savings)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Joint Savings Goals Section */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Joint Savings Goals</Text>

          {goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No joint savings goals created yet.
              </Text>
            </View>
          ) : (
            goals.map((g) => (
              <SavingsGoalCard
                key={g.id}
                id={g.id}
                goalName={g.goal_name}
                targetAmount={g.target_amount}
                currentProgress={g.current_progress}
                completionPercentage={g.completion_percentage}
                targetDate={g.target_date}
                isCompleted={g.is_completed}
                onDelete={() => handleDeleteGoal(g.id)}
                isDarkMode={isDarkMode}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Floating Add Savings Goal Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Savings Goal Modal with Keyboard Overlapping Fix */}
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
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Joint Savings Goal</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Goal Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="e.g. Vacation, Emergency Fund"
                placeholderTextColor={colors.textMuted}
                value={goalName}
                onChangeText={setGoalName}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Target Amount (₹)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="e.g. 100000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Target Date (YYYY-MM-DD) (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="2026-12-31"
                placeholderTextColor={colors.textMuted}
                value={targetDate}
                onChangeText={setTargetDate}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateGoal}
                  disabled={submitting}
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Create Goal</Text>
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
  overviewCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  combinedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '800',
  },
  lifetimeText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  partnerList: {
    gap: 8,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  partnerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  partnerSavingsAmt: {
    fontSize: 14,
    fontWeight: '800',
  },
  partnerLifetimeText: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 24,
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
    fontWeight: '600',
    marginBottom: 6,
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
