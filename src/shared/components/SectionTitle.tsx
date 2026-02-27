import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
});
