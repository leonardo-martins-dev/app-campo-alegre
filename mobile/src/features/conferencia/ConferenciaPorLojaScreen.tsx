import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation/types';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import ListSkeleton from '../../shared/components/ListSkeleton';
import { useAuth } from '../../core/auth/AuthContext';
import { fetchCanhotos, atualizarStatusCanhoto } from '../../core/api/canhotos';
import type { Canhoto } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConferenciaPorLoja'>;

const statusLabel: Record<string, string> = {
  enviado: 'Enviado',
  pendente: 'Pendente',
  divergente: 'Divergente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};
const statusColor: Record<string, string> = {
  enviado: colors.success,
  pendente: colors.warning,
  divergente: colors.error,
  aprovado: colors.success,
  rejeitado: colors.error,
};

export default function ConferenciaPorLojaScreen({ route }: Props) {
  const { lojaId, lojaNome } = route.params;
  const { user } = useAuth();
  const isSupervisor = user?.nivelAcesso === 'supervisor';

  const [canhotos, setCanhotos] = useState<Canhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (withSkeleton: boolean) => {
      if (withSkeleton) setLoading(true);
      try {
        const data = await fetchCanhotos(undefined, lojaId);
        setCanhotos(data);
      } catch {
        setCanhotos([]);
      } finally {
        setLoading(false);
      }
    },
    [lojaId]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const enviados = canhotos.filter((c) => ['enviado', 'divergente', 'aprovado', 'rejeitado'].includes(c.status));
  const pendentes = canhotos.filter((c) => c.status === 'pendente');

  const conferir = (canhotoId: string, status: Canhoto['status']) => {
    if (!user?.id) return;
    Alert.alert('Conferência', `Confirmar ${statusLabel[status] ?? status}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await atualizarStatusCanhoto(canhotoId, status, user.id);
            await load(false);
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha na conferência.');
          }
        },
      },
    ]);
  };

  const renderActions = (c: Canhoto) => {
    if (!isSupervisor || c.status !== 'enviado') return null;
    return (
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnOk} onPress={() => conferir(c.id, 'aprovado')}>
          <Text style={styles.btnText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDiv} onPress={() => conferir(c.id, 'divergente')}>
          <Text style={styles.btnText}>Divergência</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenLayout>
      <SectionTitle>{lojaNome}</SectionTitle>

      <SectionTitle>Canhotos enviados</SectionTitle>
      {loading ? (
        <ListSkeleton count={3} variant="canhoto" />
      ) : enviados.length === 0 ? (
        <Text style={styles.empty}>Nenhum canhoto enviado nesta loja.</Text>
      ) : (
        enviados.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: (statusColor[c.status] ?? colors.textSecondary) + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor[c.status] ?? colors.textSecondary }]}>
                  {statusLabel[c.status] ?? c.status}
                </Text>
              </View>
            </View>
            <Text style={styles.data}>{c.data}{c.enviadoEm ? ` · Enviado ${c.enviadoEm}` : ''}</Text>
            {renderActions(c)}
          </View>
        ))
      )}

      <SectionTitle>Canhotos pendentes</SectionTitle>
      {loading ? (
        <ListSkeleton count={2} variant="canhoto" />
      ) : pendentes.length === 0 ? (
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
  empty: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.sm },
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
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnOk: { flex: 1, backgroundColor: colors.success, padding: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center' },
  btnDiv: { flex: 1, backgroundColor: colors.warning, padding: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
