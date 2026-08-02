import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials, setLoading, setError } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import { darkColors, lightColors } from '../../theme/colors';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await authApi.login({ email, password });
      dispatch(setCredentials(res.data));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to login.';
      dispatch(setError(msg));
      Alert.alert('Login Failed', msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>TwinWallet</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Manage Together. Save Together.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Welcome Back</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your.email@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            New to TwinWallet? <Text style={{ color: colors.primary, fontWeight: '700' }}>Register Profile</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 18,
  },
});
