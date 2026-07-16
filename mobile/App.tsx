import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/core/auth/AuthContext';
import AppNavigator from './src/app/navigation/AppNavigator';
import ErrorBoundary from './src/shared/components/ErrorBoundary';
import ConfigErrorScreen from './src/shared/components/ConfigErrorScreen';
import PoweredBySplash from './src/shared/components/PoweredBySplash';
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
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppRoot />
        {showSplash ? <PoweredBySplash onFinish={handleSplashFinish} /> : null}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
