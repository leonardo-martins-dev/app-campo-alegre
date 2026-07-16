import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import ListSkeleton from '../../shared/components/ListSkeleton';
import { fetchUsuarios, type UsuarioDetalhe } from '../../core/api/profiles';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

const nivelLabel: Record<string, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  administracao: 'Administração',
  admin: 'Admin',
};

/**
 * Somente leitura — fonte da verdade é o painel jotter-logix (sync → Supabase).
 */
export default function GestaoUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioDetalhe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsuarios(await fetchUsuarios());
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenLayout>
      <SectionTitle>Usuários</SectionTitle>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Gerido no painel web</Text>
        <Text style={styles.bannerText}>
          Criar, editar e desativar usuários é feito no jotter-logix. O app apenas reflete os dados sincronizados.
        </Text>
      </View>

      {loading ? (
        <ListSkeleton count={4} variant="canhoto" />
      ) : usuarios.length === 0 ? (
        <Text style={styles.empty}>Nenhum usuário sincronizado ainda.</Text>
      ) : (
        usuarios.map((u) => (
          <View key={u.id} style={[styles.card, !u.ativo && styles.cardInactive]}>
            <Text style={styles.nome}>{u.nome}</Text>
            <Text style={styles.meta}>{u.email}</Text>
            {u.telefone ? <Text style={styles.meta}>{u.telefone}</Text> : null}
            <Text style={styles.meta}>
              {nivelLabel[u.nivelAcesso] ?? u.nivelAcesso}
              {u.lojasNomes?.length ? ` · ${u.lojasNomes.join(', ')}` : ''}
              {!u.ativo ? ' · Inativo' : ''}
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
