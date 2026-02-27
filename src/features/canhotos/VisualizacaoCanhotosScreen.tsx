import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { MOCK_CANHOTOS } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

const statusLabel: Record<string, string> = {
  enviado: 'Enviado',
  pendente: 'Pendente',
  divergente: 'Divergente',
};
const statusColor: Record<string, string> = {
  enviado: colors.success,
  pendente: colors.warning,
  divergente: colors.error,
};

export default function VisualizacaoCanhotosScreen() {
  return (
    <ScreenLayout>
      <SectionTitle>Canhotos lançados</SectionTitle>
      {MOCK_CANHOTOS.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.numero}>{c.numero}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{statusLabel[c.status]}</Text>
            </View>
          </View>
          <Text style={styles.loja}>{c.loja}</Text>
          <Text style={styles.data}>{c.data} {c.enviadoEm ? `· Enviado ${c.enviadoEm}` : ''}</Text>
        </View>
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { ...typography.subtitle, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { fontSize: 12, fontWeight: '600' },
  loja: { ...typography.caption, color: colors.text, marginTop: 4 },
  data: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
