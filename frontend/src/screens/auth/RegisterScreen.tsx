import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials, setLoading, setError } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import { darkColors, lightColors } from '../../theme/colors';

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await authApi.register({ full_name: fullName, email, password });
      dispatch(setCredentials(res.data));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed.';
      dispatch(setError(msg));
      Alert.alert('Registration Failed', msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Create User Profile</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          TwinWallet strictly supports exactly TWO partner accounts.
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Venkata Sai Gopi / Ananya"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
        />

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
          onPress={handleRegister}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Register Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text>
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
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
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
  loginLink: {
    alignItems: 'center',
    marginTop: 18,
  },
});
