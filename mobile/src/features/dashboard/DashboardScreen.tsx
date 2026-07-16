import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { fetchDashboardMetrics } from '../../core/api/dashboard';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';

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
    { label: 'Pendentes', value: metrics.canhotosPendentes, color: colors.warning },
    { label: 'Procedimentos', value: metrics.procedimentosHoje, color: colors.navy },
    { label: 'Divergências', value: metrics.divergenciasPendentes, color: colors.error },
    { label: 'Usuários ativos', value: metrics.usuariosAtivos, color: colors.success },
  ];

  return (
    <ScreenLayout>
      <SectionTitle subtitle="Métricas do dia">Visão geral</SectionTitle>
      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.card}>
            <View style={[styles.dot, { backgroundColor: c.color }]} />
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  value: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8 },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
