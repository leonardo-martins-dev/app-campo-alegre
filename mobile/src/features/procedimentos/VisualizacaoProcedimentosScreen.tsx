import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { fetchProcedimentos } from '../../core/api/procedimentos';
import type { Procedimento } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

export default function VisualizacaoProcedimentosScreen() {
  const [lista, setLista] = useState<Procedimento[]>([]);

  useEffect(() => {
    fetchProcedimentos('promotor').then(setLista).catch(() => setLista([]));
  }, []);

  return (
    <ScreenLayout>
      <SectionTitle>Procedimentos enviados</SectionTitle>
      {lista.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.colaborador}>{p.colaborador}</Text>
          <Text style={styles.loja}>{p.loja} · {p.data}</Text>
          <View style={styles.footer}>
            <Text style={styles.badge}>{p.itensOk}/{p.itensTotal} itens</Text>
            <View style={[styles.status, p.status === 'completo' ? styles.statusOk : styles.statusPendente]}>
              <Text style={styles.statusText}>{p.status === 'completo' ? 'Completo' : 'Pendente'}</Text>
            </View>
          </View>
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
  colaborador: { ...typography.subtitle, color: colors.text },
  loja: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  badge: { ...typography.small, color: colors.textSecondary },
  status: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  statusOk: { backgroundColor: colors.success + '20' },
  statusPendente: { backgroundColor: colors.warning + '20' },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.text },
});
