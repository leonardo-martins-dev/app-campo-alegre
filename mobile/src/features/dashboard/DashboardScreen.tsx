import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { fetchDashboardMetrics } from '../../core/api/dashboard';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState({
    canhotosHoje: 0,
    canhotosPendentes: 0,
    procedimentosHoje: 0,
    divergenciasPendentes: 0,
    usuariosAtivos: 0,
  });

  useEffect(() => {
    fetchDashboardMetrics().then(setMetrics).catch(() => {});
  }, []);

  const cards = [
    { label: 'Canhotos hoje', value: metrics.canhotosHoje, color: colors.primary },
    { label: 'Canhotos pendentes', value: metrics.canhotosPendentes, color: colors.warning },
    { label: 'Procedimentos hoje', value: metrics.procedimentosHoje, color: colors.secondary },
    { label: 'Divergências pendentes', value: metrics.divergenciasPendentes, color: colors.error },
    { label: 'Usuários ativos', value: metrics.usuariosAtivos, color: colors.success },
  ];

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
