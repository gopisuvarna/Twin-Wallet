import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { transactionApi } from '../../api/transactionApi';
import { darkColors, lightColors } from '../../theme/colors';

const INCOME_SOURCES = ['Salary', 'Bonus', 'Gift', 'Freelancing', 'Business', 'Investment', 'Cashback', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Travel', 'Medical', 'Rent', 'Fuel', 'Bills', 'Entertainment', 'Education', 'Insurance', 'Investment', 'Subscription', 'Gift', 'Utilities', 'Clothing', 'Others'];

export const AddTransactionScreen = ({ navigation }: any) => {
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    const finalCategory = (category === 'Others' && customName.trim()) ? customName.trim() : category;
    const finalSource = (source === 'Other' && customName.trim()) ? customName.trim() : source;

    setIsSubmitting(true);
    try {
      if (txType === 'income') {
        await transactionApi.createIncome({
          amount: numericAmount,
          source: finalSource,
          description,
          transaction_date: new Date().toISOString().split('T')[0],
        });
      } else {
        await transactionApi.createExpense({
          amount: numericAmount,
          category: finalCategory,
          description,
          transaction_date: new Date().toISOString().split('T')[0],
        });
      }
      Alert.alert('Success', `${txType === 'income' ? 'Income' : 'Expense'} entry saved!`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to save entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOtherSelected = txType === 'income' ? source === 'Other' : category === 'Others';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Add New Entry</Text>

      {/* Segmented Type Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceVariant }]}>
        <TouchableOpacity
          onPress={() => setTxType('income')}
          style={[
            styles.toggleBtn,
            txType === 'income' && { backgroundColor: colors.income },
          ]}
        >
          <Text style={[styles.toggleText, txType === 'income' && { color: '#FFF', fontWeight: '800' }]}>
            + Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTxType('expense')}
          style={[
            styles.toggleBtn,
            txType === 'expense' && { backgroundColor: colors.expense },
          ]}
        >
          <Text style={[styles.toggleText, txType === 'expense' && { color: '#FFF', fontWeight: '800' }]}>
            - Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>Amount (₹)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        style={[styles.amountInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
      />

      {/* Category / Source Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {txType === 'income' ? 'Source' : 'Category'}
      </Text>
      <View style={styles.chipContainer}>
        {(txType === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES).map((item) => {
          const isSelected = txType === 'income' ? source === item : category === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => (txType === 'income' ? setSource(item) : setCategory(item))}
              style={[
                styles.chip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#FFF' : colors.textPrimary }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Category/Source Name Box if Others/Other is selected */}
      {isOtherSelected ? (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Custom {txType === 'income' ? 'Source' : 'Category'} Name
          </Text>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            placeholder={`Enter custom ${txType === 'income' ? 'source' : 'category'} name...`}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          />
        </View>
      ) : null}

      {/* Description Input */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>Description (Optional)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add details e.g. Weekly grocery run"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
      />

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[
          styles.submitBtn,
          { backgroundColor: txType === 'income' ? colors.income : colors.expense },
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitBtnText}>Save {txType === 'income' ? 'Income' : 'Expense'}</Text>
        )}
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 60,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
  },
  submitBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
