import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatINR } from '../../utils/currency';
import { darkColors, lightColors } from '../../theme/colors';

interface PartnerContribution {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  income: number;
  expense: number;
  contribution_percentage: number;
}

interface PartnerComparisonCardProps {
  contributions: PartnerContribution[];
  isDarkMode?: boolean;
}

export const PartnerComparisonCard: React.FC<PartnerComparisonCardProps> = ({
  contributions,
  isDarkMode = true,
}) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Partner Contribution Breakdown</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Together managing & saving</Text>

      {contributions.map((partner) => (
        <View key={partner.user_id} style={styles.partnerRow}>
          <View style={styles.partnerHeader}>
            {/* Display EXACT stored user name */}
            <Text style={[styles.partnerName, { color: colors.textPrimary }]}>{partner.user_name}</Text>
            <Text style={[styles.partnerPercentage, { color: colors.primary }]}>
              {partner.contribution_percentage.toFixed(1)}% Contribution
            </Text>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(0, partner.contribution_percentage))}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Income: <Text style={{ color: colors.income, fontWeight: '700' }}>{formatINR(partner.income)}</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Expense: <Text style={{ color: colors.expense, fontWeight: '700' }}>{formatINR(partner.expense)}</Text>
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  partnerRow: {
    marginBottom: 16,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  partnerPercentage: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
  },
});
