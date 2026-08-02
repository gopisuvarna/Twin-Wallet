import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export const AuthNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'Register'>('Login');

  return (
    <View style={styles.container}>
      {currentScreen === 'Login' ? (
        <LoginScreen navigation={{ navigate: (screen: 'Login' | 'Register') => setCurrentScreen(screen) }} />
      ) : (
        <RegisterScreen navigation={{ navigate: (screen: 'Login' | 'Register') => setCurrentScreen(screen) }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
