import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  children: string;
  subtitle?: string;
};

export default function SectionTitle({ children, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.navy,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
