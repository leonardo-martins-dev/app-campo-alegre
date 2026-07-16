import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const NOPONTO = {
  navy: '#0B4467',
  navyDeep: '#062F4A',
  cyan: '#00AEEF',
  white: '#FFFFFF',
} as const;

type Props = {
  width?: number;
};

/**
 * Wordmark No Ponto — tipografia nativa (mais nítida que SVG Text).
 * Apenas "no" + "ponto".
 */
export default function NoPontoLogo({ width = 220 }: Props) {
  const fontSize = Math.round(width * 0.195);

  return (
    <View style={[styles.row, { maxWidth: width }]}>
      <Text style={[styles.word, { fontSize, color: NOPONTO.cyan }]}>no</Text>
      <Text style={[styles.word, { fontSize, color: NOPONTO.white }]}>ponto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  word: {
    fontWeight: '700',
    letterSpacing: -1.1,
  },
});
