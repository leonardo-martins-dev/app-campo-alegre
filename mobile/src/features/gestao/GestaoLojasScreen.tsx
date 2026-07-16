import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { fetchLojasAtivas } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

export default function GestaoLojasScreen() {
  const [lojas, setLojas] = useState<Loja[]>([]);

  useEffect(() => {
    fetchLojasAtivas()
      .then((all) => setLojas(all))
      .catch(() => setLojas([]));
  }, []);

  return (
    <ScreenLayout>
      <SectionTitle>Lojas</SectionTitle>
      {lojas.map((l) => (
        <View key={l.id} style={[styles.card, !l.ativa && styles.cardInativa]}>
          <Text style={styles.nome}>{l.nome}</Text>
          <Text style={styles.codigo}>{l.codigo} · {l.regiao}</Text>
          <View style={[styles.badge, l.ativa ? styles.badgeAtiva : styles.badgeInativa]}>
            <Text style={styles.badgeText}>{l.ativa ? 'Ativa' : 'Inativa'}</Text>
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
  cardInativa: { opacity: 0.7 },
  nome: { ...typography.subtitle, color: colors.text },
  codigo: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  badgeAtiva: { backgroundColor: colors.success + '20' },
  badgeInativa: { backgroundColor: colors.border },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
});
