import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { darkColors, lightColors } from '../theme/colors';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { AddTransactionScreen } from '../screens/main/AddTransactionScreen';
import { BudgetsScreen } from '../screens/main/BudgetsScreen';
import { SavingsScreen } from '../screens/main/SavingsScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

type TabType = 'dashboard' | 'transactions' | 'add' | 'budgets' | 'savings' | 'analytics' | 'profile';

export const MainTabNavigator = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handleNavigate = (screen: string) => {
    const s = screen.toLowerCase();
    if (s.includes('add')) setCurrentTab('add');
    else if (s.includes('trans')) setCurrentTab('transactions');
    else if (s.includes('budget')) setCurrentTab('budgets');
    else if (s.includes('sav')) setCurrentTab('savings');
    else if (s.includes('analyt')) setCurrentTab('analytics');
    else if (s.includes('prof')) setCurrentTab('profile');
    else setCurrentTab('dashboard');
  };

  // Swipe / slide gesture to return to Home dashboard from any secondary tab
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Trigger swipe if on a non-dashboard screen and horizontal gesture > 60px
        return (
          currentTab !== 'dashboard' &&
          Math.abs(gestureState.dx) > 60 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 60) {
          setCurrentTab('dashboard');
        }
      },
    })
  ).current;

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen navigation={{ navigate: handleNavigate }} />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'add':
        return <AddTransactionScreen navigation={{ goBack: () => setCurrentTab('dashboard') }} />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'savings':
        return <SavingsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen navigation={{ navigate: handleNavigate }} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.screenContainer} {...panResponder.panHandlers}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={() => setCurrentTab('dashboard')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'dashboard' && { color: colors.primary }]}>🏠</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'dashboard' ? colors.primary : colors.textMuted }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('transactions')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'transactions' && { color: colors.primary }]}>📋</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'transactions' ? colors.primary : colors.textMuted }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('budgets')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'budgets' && { color: colors.primary }]}>🎯</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'budgets' ? colors.primary : colors.textMuted }]}>Budgets</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('add')} style={styles.tabItem}>
          <View style={[styles.addFab, { backgroundColor: colors.primary }]}>
            <Text style={styles.addFabText}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('savings')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'savings' && { color: colors.primary }]}>🐷</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'savings' ? colors.primary : colors.textMuted }]}>Savings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('analytics')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'analytics' && { color: colors.primary }]}>📊</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'analytics' ? colors.primary : colors.textMuted }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentTab('profile')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, currentTab === 'profile' && { color: colors.primary }]}>👤</Text>
          <Text style={[styles.tabLabel, { color: currentTab === 'profile' ? colors.primary : colors.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  addFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addFabText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
});
