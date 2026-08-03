import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { formatINR } from '../../utils/currency';

const SLICE_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
];

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryItem[];
  totalAmount: number;
  userName: string;
  colors: any;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  totalAmount,
  userName,
  colors,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    Animated.spring(animValue, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [data]);

  if (!data || data.length === 0 || totalAmount <= 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👤 {userName}'s Spending</Text>
        <Text style={{ color: colors.textMuted, marginTop: 12, textAlign: 'center' }}>
          No individual expenses recorded for this period.
        </Text>
      </View>
    );
  }

  // SVG Donut Chart parameters
  const size = 180;
  const radius = 70;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets for donut segments
  let accumulatedPercentage = 0;
  const slices = data.map((item, index) => {
    const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
    const rotation = (accumulatedPercentage / 100) * 360;
    accumulatedPercentage += item.percentage;
    const color = SLICE_COLORS[index % SLICE_COLORS.length];

    return {
      ...item,
      color,
      strokeDashoffset,
      rotation,
    };
  });

  const animatedScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const animatedOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👤 {userName}'s Analytics</Text>
        <Text style={[styles.headerTotal, { color: colors.expense }]}>{formatINR(totalAmount)}</Text>
      </View>

      {/* Animated SVG Donut Chart */}
      <Animated.View
        style={[
          styles.chartContainer,
          {
            transform: [{ scale: animatedScale }],
            opacity: animatedOpacity,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {slices.map((slice, i) => (
              <G key={i} rotation={slice.rotation} origin={`${center}, ${center}`}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </G>
            ))}
          </G>
        </Svg>

        {/* Donut Center Content */}
        <View style={styles.centerOverlay}>
          <Text style={[styles.centerLabel, { color: colors.textMuted }]}>TOTAL</Text>
          <Text style={[styles.centerVal, { color: colors.textPrimary }]}>{formatINR(totalAmount)}</Text>
        </View>
      </Animated.View>

      {/* Category Wise Legend Breakdown */}
      <View style={styles.legendContainer}>
        {slices.map((slice) => (
          <View key={slice.category} style={[styles.legendRow, { borderColor: colors.border }]}>
            <View style={styles.legendLeft}>
              <View style={[styles.colorDot, { backgroundColor: slice.color }]} />
              <Text style={[styles.catName, { color: colors.textPrimary }]}>{slice.category}</Text>
            </View>

            <View style={styles.legendRight}>
              <Text style={[styles.catAmt, { color: colors.textPrimary }]}>{formatINR(slice.amount)}</Text>
              <Text style={[styles.catPct, { color: colors.textSecondary }]}>
                {slice.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  centerVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  legendContainer: {
    marginTop: 16,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  catAmt: {
    fontSize: 14,
    fontWeight: '700',
  },
  catPct: {
    fontSize: 11,
    marginTop: 1,
  },
});
