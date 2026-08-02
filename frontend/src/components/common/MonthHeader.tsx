import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedYear, setSelectedMonth } from '../../store/walletSlice';
import { ledgerApi } from '../../api/ledgerApi';
import { darkColors, lightColors } from '../../theme/colors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthHeaderProps {
  onMonthChanged?: () => void;
}

export const MonthHeader: React.FC<MonthHeaderProps> = ({ onMonthChanged }) => {
  const dispatch = useDispatch();
  const { selectedYear, selectedMonth } = useSelector((state: RootState) => state.wallet);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      dispatch(setSelectedMonth(12));
      dispatch(setSelectedYear(selectedYear - 1));
    } else {
      dispatch(setSelectedMonth(selectedMonth - 1));
    }
    if (onMonthChanged) onMonthChanged();
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      dispatch(setSelectedMonth(1));
      dispatch(setSelectedYear(selectedYear + 1));
    } else {
      dispatch(setSelectedMonth(selectedMonth + 1));
    }
    if (onMonthChanged) onMonthChanged();
  };

  const handleRollForward = async () => {
    Alert.alert(
      'Roll-Forward Balance',
      `Roll forward opening balance into ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await ledgerApi.rollForward(selectedYear, selectedMonth);
              Alert.alert('Success', 'Closing balance rolled forward into new month opening balance!');
              if (onMonthChanged) onMonthChanged();
            } catch (err: any) {
              Alert.alert('Roll-Forward Error', err?.response?.data?.detail || 'Failed to roll forward balance.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
        <Text style={[styles.arrowText, { color: colors.primary }]}>◀</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={[styles.monthText, { color: colors.textPrimary }]}>
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
        <Text style={[styles.arrowText, { color: colors.primary }]}>▶</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRollForward} style={[styles.rollBtn, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.rollBtnText, { color: colors.primary }]}>🔄 Roll</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  arrowBtn: {
    padding: 8,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '800',
  },
  titleContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '800',
  },
  rollBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rollBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
