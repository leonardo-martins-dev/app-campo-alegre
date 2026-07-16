import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NOPONTO } from '../icons/NoPontoLogo';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[NOPONTO.navyDeep, NOPONTO.navy]}
        style={StyleSheet.absoluteFill}
      />
      <ActivityIndicator size="large" color={NOPONTO.cyan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NOPONTO.navy,
  },
});
