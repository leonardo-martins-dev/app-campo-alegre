import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { fetchUsuarios } from '../../core/api/profiles';
import type { Usuario } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

export default function GestaoUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    fetchUsuarios().then(setUsuarios).catch(() => setUsuarios([]));
  }, []);

  return (
    <ScreenLayout>
      <SectionTitle>Usuários</SectionTitle>
      {usuarios.map((u) => (
        <View key={u.id} style={[styles.card, !u.ativo && styles.cardInativo]}>
          <Text style={styles.nome}>{u.nome}</Text>
          <Text style={styles.email}>{u.email}</Text>
          <View style={styles.footer}>
            <View style={[styles.badge, u.ativo ? styles.badgeAtivo : styles.badgeInativo]}>
              <Text style={styles.badgeText}>{u.nivel}</Text>
            </View>
            {u.loja && <Text style={styles.loja}>{u.loja}</Text>}
            <Text style={[styles.ativo, !u.ativo && styles.ativoOff]}>{u.ativo ? 'Ativo' : 'Inativo'}</Text>
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
  cardInativo: { opacity: 0.7 },
  nome: { ...typography.subtitle, color: colors.text },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeAtivo: { backgroundColor: colors.primary + '20' },
  badgeInativo: { backgroundColor: colors.border },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  loja: { ...typography.small, color: colors.textSecondary },
  ativo: { ...typography.small, color: colors.success, marginLeft: 'auto' },
  ativoOff: { color: colors.textSecondary },
});
