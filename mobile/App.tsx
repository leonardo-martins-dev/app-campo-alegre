import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/core/auth/AuthContext';
import AppNavigator from './src/app/navigation/AppNavigator';
import ErrorBoundary from './src/shared/components/ErrorBoundary';
import ConfigErrorScreen from './src/shared/components/ConfigErrorScreen';
import { isSupabaseConfigured } from './src/core/supabase/client';

function AppRoot() {
  if (!isSupabaseConfigured && !__DEV__) {
    return <ConfigErrorScreen />;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppRoot />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
