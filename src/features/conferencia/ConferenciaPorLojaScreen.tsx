import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation/types';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { MOCK_CANHOTOS } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConferenciaPorLoja'>;

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

export default function ConferenciaPorLojaScreen({ route }: Props) {
  const { lojaNome } = route.params;
  const canhotosLoja = MOCK_CANHOTOS.filter((c) => c.loja === lojaNome);
  const enviados = canhotosLoja.filter((c) => c.status === 'enviado' || c.status === 'divergente');
  const pendentes = canhotosLoja.filter((c) => c.status === 'pendente');

  return (
    <ScreenLayout>
      <SectionTitle>{lojaNome}</SectionTitle>

      <SectionTitle>Canhotos enviados</SectionTitle>
      {enviados.length === 0 ? (
        <Text style={styles.empty}>Nenhum canhoto enviado nesta loja.</Text>
      ) : (
        enviados.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{statusLabel[c.status]}</Text>
              </View>
            </View>
            <Text style={styles.data}>{c.data}{c.enviadoEm ? ` · Enviado ${c.enviadoEm}` : ''}</Text>
          </View>
        ))
      )}

      <SectionTitle>Canhotos pendentes</SectionTitle>
      {pendentes.length === 0 ? (
        <Text style={styles.empty}>Nenhum canhoto pendente nesta loja.</Text>
      ) : (
        pendentes.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{statusLabel[c.status]}</Text>
              </View>
            </View>
            <Text style={styles.data}>{c.data}</Text>
          </View>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { ...typography.subtitle, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  badgeText: { fontSize: 12, fontWeight: '600' },
  data: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
});
