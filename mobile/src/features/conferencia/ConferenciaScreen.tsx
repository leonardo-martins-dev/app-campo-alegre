import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation/types';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import ListSkeleton from '../../shared/components/ListSkeleton';
import { useAuth } from '../../core/auth/AuthContext';
import { fetchCanhotos } from '../../core/api/canhotos';
import { fetchResumoConferenciaPorLoja } from '../../core/api/conferencia';
import type { Canhoto, ConferenciaItem } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Upload } from 'lucide-react-native';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Conferencia'> };

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

export default function ConferenciaScreen({ navigation }: Props) {
  const { user } = useAuth();
  const role = user?.nivelAcesso ?? 'colaborador';
  const isColaborador = role === 'colaborador';
  const isResumoPorLoja = role === 'supervisor' || role === 'administracao' || role === 'admin';
  const podeEnviarCanhoto = role !== 'administracao';

  const [canhotos, setCanhotos] = useState<Canhoto[]>([]);
  const [resumo, setResumo] = useState<ConferenciaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLoadedOnce = React.useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadError(null);
      if (!hasLoadedOnce.current) setLoading(true);

      const load = async () => {
        try {
          if (isColaborador) {
            const data = await fetchCanhotos(user?.id);
            if (!cancelled) setCanhotos(data);
          } else if (isResumoPorLoja) {
            const data = await fetchResumoConferenciaPorLoja();
            if (!cancelled) setResumo(data);
          }
          if (!cancelled) hasLoadedOnce.current = true;
        } catch {
          if (!cancelled) {
            if (isColaborador) setCanhotos([]);
            else setResumo([]);
            setLoadError(
              isColaborador
                ? 'Não foi possível carregar os canhotos. Verifique sua conexão.'
                : 'Não foi possível carregar o resumo. Verifique sua conexão.'
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      load();
      return () => {
        cancelled = true;
      };
    }, [isColaborador, isResumoPorLoja, user?.id])
  );

  const ultimosEnviados = canhotos.filter((c) => c.status === 'enviado' || c.status === 'aprovado');
  const pendentes = canhotos.filter((c) => c.status === 'pendente');

  return (
    <ScreenLayout>
      {podeEnviarCanhoto && (
        <TouchableOpacity
          style={styles.enviarBtn}
          onPress={() => navigation.navigate('LancamentoCanhoto')}
          activeOpacity={0.9}
        >
          <Upload size={22} color="#fff" />
          <Text style={styles.enviarBtnText}>Enviar canhoto</Text>
        </TouchableOpacity>
      )}

      {loadError && <Text style={styles.error}>{loadError}</Text>}

      {isColaborador ? (
        <>
          <SectionTitle>Últimos canhotos enviados</SectionTitle>
          {loading ? (
            <ListSkeleton count={2} variant="canhoto" />
          ) : ultimosEnviados.length === 0 ? (
            <Text style={styles.empty}>Nenhum canhoto enviado ainda.</Text>
          ) : (
            ultimosEnviados.map((c) => (
              <View key={c.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.numero}>{c.numero}</Text>
                  <View style={[styles.badge, { backgroundColor: (statusColor[c.status] ?? colors.textSecondary) + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusColor[c.status] ?? colors.textSecondary }]}>
                      {statusLabel[c.status] ?? c.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.loja}>{c.loja}</Text>
                <Text style={styles.data}>{c.data} {c.enviadoEm ? `· Enviado ${c.enviadoEm}` : ''}</Text>
              </View>
            ))
          )}

          <SectionTitle>Canhotos pendentes</SectionTitle>
          {loading ? (
            <ListSkeleton count={2} variant="canhoto" />
          ) : pendentes.length === 0 ? (
            <Text style={styles.empty}>Nenhum canhoto pendente.</Text>
          ) : (
            pendentes.map((c) => (
              <View key={c.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.numero}>{c.numero}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>{statusLabel[c.status]}</Text>
                  </View>
                </View>
                <Text style={styles.loja}>{c.loja}</Text>
                <Text style={styles.data}>{c.data}</Text>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <SectionTitle>Resumo por loja</SectionTitle>
          <Text style={styles.hint}>Toque em uma loja para ver canhotos enviados e pendentes.</Text>
          {loading ? (
            <ListSkeleton count={3} variant="loja" />
          ) : resumo.length === 0 ? (
            <Text style={styles.empty}>Nenhuma loja encontrada.</Text>
          ) : (
            resumo.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('ConferenciaPorLoja', { lojaId: item.id, lojaNome: item.loja })}
                activeOpacity={0.8}
              >
                <Text style={styles.loja}>{item.loja}</Text>
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.canhotosEnviados}</Text>
                    <Text style={styles.statLabel}>Enviados</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, item.canhotosPendentes > 0 && { color: colors.warning }]}>
                      {item.canhotosPendentes}
                    </Text>
                    <Text style={styles.statLabel}>Pendentes</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, item.divergencias > 0 && { color: colors.error }]}>
                      {item.divergencias}
                    </Text>
                    <Text style={styles.statLabel}>Divergências</Text>
                  </View>
                </View>
                <Text style={styles.updated}>Atualizado: {item.ultimaAtualizacao}</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  enviarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: 8,
  },
  enviarBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  empty: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontSize: 16, fontWeight: '700', color: colors.navy, letterSpacing: -0.2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  badgeText: { fontSize: 11, fontWeight: '600' },
  loja: { ...typography.caption, color: colors.text, marginTop: 6 },
  data: { ...typography.small, color: colors.textMuted, marginTop: 3 },
  stats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.navy },
  statLabel: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  updated: { ...typography.small, color: colors.textMuted, marginTop: spacing.md },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
});
