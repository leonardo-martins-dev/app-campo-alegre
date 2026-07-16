import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import ListSkeleton from '../../shared/components/ListSkeleton';
import { fetchLojas } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

/**
 * Somente leitura — fonte da verdade é o painel jotter-logix (sync → Supabase).
 */
export default function GestaoLojasScreen() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLojas(await fetchLojas(true));
    } catch {
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenLayout>
      <SectionTitle>Lojas</SectionTitle>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Gerido no painel web</Text>
        <Text style={styles.bannerText}>
          Cadastro e ativação de lojas é feito no jotter-logix. O app apenas reflete os dados sincronizados.
        </Text>
      </View>

      {loading ? (
        <ListSkeleton count={3} variant="loja" />
      ) : lojas.length === 0 ? (
        <Text style={styles.empty}>Nenhuma loja sincronizada ainda.</Text>
      ) : (
        lojas.map((l) => (
          <View key={l.id} style={[styles.card, !l.ativa && styles.cardInactive]}>
            <Text style={styles.nome}>{l.nome}</Text>
            <Text style={styles.meta}>
              Código: {l.codigo}
              {l.regiao ? ` · ${l.regiao}` : ''}
              {!l.ativa ? ' · Inativa' : ''}
            </Text>
          </View>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTitle: { ...typography.subtitle, color: colors.navy, marginBottom: 4 },
  bannerText: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.caption, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInactive: { opacity: 0.55 },
  nome: { fontSize: 16, fontWeight: '700', color: colors.navy },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
