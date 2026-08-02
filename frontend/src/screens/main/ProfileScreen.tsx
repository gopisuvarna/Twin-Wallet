import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { darkColors, lightColors } from '../../theme/colors';

export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of TwinWallet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>User Profile</Text>

      {/* User Info Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.full_name}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        <View style={[styles.badge, { backgroundColor: colors.incomeBg }]}>
          <Text style={[styles.badgeText, { color: colors.income }]}>Twin Member Account</Text>
        </View>
      </View>

      {/* Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => {
              dispatch(toggleTheme());
            }}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        style={[styles.logoutBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expense }]}
      >
        <Text style={[styles.logoutText, { color: colors.expense }]}>Sign Out of TwinWallet</Text>
      </TouchableOpacity>
    </View>
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
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
