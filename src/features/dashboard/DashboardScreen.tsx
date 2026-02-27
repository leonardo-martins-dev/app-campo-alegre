import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { MOCK_DASHBOARD } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

const cards = [
  { label: 'Canhotos hoje', value: MOCK_DASHBOARD.canhotosHoje, color: colors.primary },
  { label: 'Canhotos pendentes', value: MOCK_DASHBOARD.canhotosPendentes, color: colors.warning },
  { label: 'Procedimentos hoje', value: MOCK_DASHBOARD.procedimentosHoje, color: colors.secondary },
  { label: 'Divergências pendentes', value: MOCK_DASHBOARD.divergenciasPendentes, color: colors.error },
  { label: 'Usuários ativos', value: MOCK_DASHBOARD.usuariosAtivos, color: colors.success },
];

export default function DashboardScreen() {
  return (
    <ScreenLayout>
      <SectionTitle>Visão geral</SectionTitle>
      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.label} style={[styles.card, { borderLeftColor: c.color }]}>
            <Text style={[styles.value, { color: c.color }]}>{c.value}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  value: { fontSize: 24, fontWeight: '700' },
  label: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
});
