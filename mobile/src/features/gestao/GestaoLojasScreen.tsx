import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import ListSkeleton from '../../shared/components/ListSkeleton';
import { fetchLojas } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

/**
 * Somente leitura — fonte da verdade é o painel jotter-logix (sync → Supabase).
 * Lista apenas lojas ativas.
 */
export default function GestaoLojasScreen() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLojas(await fetchLojas(false));
    } catch {
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return lojas;
    return lojas.filter((l) => l.nome.toLowerCase().includes(q));
  }, [lojas, busca]);

  return (
    <ScreenLayout>
      <SectionTitle>Lojas</SectionTitle>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Gerido no painel web</Text>
        <Text style={styles.bannerText}>
          Cadastro e ativação de lojas é feito no jotter-logix. O app mostra apenas lojas ativas.
        </Text>
      </View>

      {!loading && lojas.length > 0 && (
        <View style={styles.searchRow}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar loja..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {loading ? (
        <ListSkeleton count={3} variant="loja" />
      ) : filtradas.length === 0 ? (
        <Text style={styles.empty}>
          {busca.trim() ? 'Nenhuma loja encontrada.' : 'Nenhuma loja ativa sincronizada.'}
        </Text>
      ) : (
        filtradas.map((l) => (
          <View key={l.id} style={styles.card}>
            <Text style={styles.nome}>{l.nome}</Text>
            {l.regiao ? <Text style={styles.meta}>{l.regiao}</Text> : null}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  empty: { ...typography.caption, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nome: { fontSize: 16, fontWeight: '700', color: colors.navy },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
