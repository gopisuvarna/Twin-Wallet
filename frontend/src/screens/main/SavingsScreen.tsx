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
import { savingsApi, SavingsGoalResponseData } from '../../api/savingsApi';
import { SavingsGoalCard } from '../../components/savings/SavingsGoalCard';
import { darkColors, lightColors } from '../../theme/colors';

export const SavingsScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const [goals, setGoals] = useState<SavingsGoalResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await savingsApi.getSavingsGoals();
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to fetch savings goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

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
      fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to create savings goal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Savings Goals</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Save together for future targets</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                goalName={g.goal_name}
                targetAmount={g.target_amount}
                currentProgress={g.current_progress}
                completionPercentage={g.completion_percentage}
                targetDate={g.target_date}
                isCompleted={g.is_completed}
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

      {/* Add Savings Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Savings Goal</Text>

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
