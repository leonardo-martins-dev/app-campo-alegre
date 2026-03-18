import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation/types';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { useAuth } from '../../core/auth/AuthContext';
import { MOCK_CONFERENCIA, MOCK_CANHOTOS } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { Upload } from 'lucide-react-native';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Conferencia'> };

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

export default function ConferenciaScreen({ navigation }: Props) {
  const { user } = useAuth();
  const role = user?.nivelAcesso ?? 'colaborador';
  const isColaborador = role === 'colaborador';
  const podeEnviarCanhoto = role !== 'administracao'; // administração só visualiza

  const ultimosEnviados = MOCK_CANHOTOS.filter((c) => c.status === 'enviado');
  const pendentes = MOCK_CANHOTOS.filter((c) => c.status === 'pendente');

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

      {isColaborador ? (
        <>
          <SectionTitle>Últimos canhotos enviados</SectionTitle>
          {ultimosEnviados.length === 0 ? (
            <Text style={styles.empty}>Nenhum canhoto enviado ainda.</Text>
          ) : (
            ultimosEnviados.map((c) => (
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
            ))
          )}

          <SectionTitle>Canhotos pendentes</SectionTitle>
          {pendentes.length === 0 ? (
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
          {MOCK_CONFERENCIA.map((item) => (
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
                  <Text style={[styles.statValue, item.canhotosPendentes > 0 && { color: colors.warning }]}>{item.canhotosPendentes}</Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, item.divergencias > 0 && { color: colors.error }]}>{item.divergencias}</Text>
                  <Text style={styles.statLabel}>Divergências</Text>
                </View>
              </View>
              <Text style={styles.updated}>Atualizado: {item.ultimaAtualizacao}</Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  enviarBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
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
  loja: { ...typography.caption, color: colors.text, marginTop: 4 },
  data: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.lg },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  updated: { ...typography.small, color: colors.textSecondary, marginTop: spacing.md },
  hint: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.sm },
});
