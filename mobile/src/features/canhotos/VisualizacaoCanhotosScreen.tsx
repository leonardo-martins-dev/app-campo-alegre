import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import LojaPicker from '../../shared/components/LojaPicker';
import {
  type CanhotoLancadoDetalhe,
  type CanhotoSistema,
} from '../../shared/mock/data';
import { fetchCanhotosLancados, fetchCanhotosSistema } from '../../core/api/canhotos';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

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

export default function VisualizacaoCanhotosScreen() {
  const [tab, setTab] = useState<'lancados' | 'sistema' | 'atrasados'>('lancados');
  const [numeroFiltro, setNumeroFiltro] = useState('');
  const [lojaIdsFiltro, setLojaIdsFiltro] = useState<string[]>([]);
  const [lojaNomesFiltro, setLojaNomesFiltro] = useState<string[]>([]);

  const [lancados, setLancados] = useState<CanhotoLancadoDetalhe[]>([]);
  const [sistema, setSistema] = useState<CanhotoSistema[]>([]);

  useEffect(() => {
    fetchCanhotosLancados().then(setLancados).catch(() => setLancados([]));
    fetchCanhotosSistema().then(setSistema).catch(() => setSistema([]));
  }, []);

  const filtradosLancados = useMemo(() => {
    return lancados.filter((c) => {
      if (numeroFiltro && !c.numero.includes(numeroFiltro.trim())) return false;
      if (lojaNomesFiltro.length > 0 && !lojaNomesFiltro.includes(c.loja)) return false;
      return true;
    });
  }, [lancados, numeroFiltro, lojaNomesFiltro]);

  const filtradosSistemaDisponiveis = useMemo<CanhotoSistema[]>(() => {
    return sistema.filter((c) => {
      if (c.status !== 'disponivel') return false;
      if (numeroFiltro && !c.numero.includes(numeroFiltro.trim())) return false;
      if (lojaNomesFiltro.length > 0 && !lojaNomesFiltro.includes(c.nome_fantasia ?? '')) return false;
      return true;
    });
  }, [sistema, numeroFiltro, lojaNomesFiltro]);

  const filtradosSistemaAtrasados = useMemo<CanhotoSistema[]>(() => {
    return sistema.filter((c) => {
      if (c.status !== 'atrasado') return false;
      if (numeroFiltro && !c.numero.includes(numeroFiltro.trim())) return false;
      if (lojaNomesFiltro.length > 0 && !lojaNomesFiltro.includes(c.nome_fantasia ?? '')) return false;
      return true;
    });
  }, [sistema, numeroFiltro, lojaNomesFiltro]);

  const limparFiltros = () => {
    setNumeroFiltro('');
    setLojaIdsFiltro([]);
    setLojaNomesFiltro([]);
  };

  return (
    <ScreenLayout>
      <SectionTitle>Canhotos (Admin)</SectionTitle>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'lancados' && styles.tabActive]}
          onPress={() => setTab('lancados')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'lancados' && styles.tabTextActive]}>Lançados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sistema' && styles.tabActive]}
          onPress={() => setTab('sistema')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'sistema' && styles.tabTextActive]}>Sistema disponíveis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'atrasados' && styles.tabActive]}
          onPress={() => setTab('atrasados')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'atrasados' && styles.tabTextActive]}>Atrasados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filtrar por número"
          placeholderTextColor={colors.textSecondary}
          value={numeroFiltro}
          onChangeText={setNumeroFiltro}
          keyboardType="number-pad"
        />
        <LojaPicker
          label="Filtrar por loja"
          selectedIds={lojaIdsFiltro}
          placeholder="Selecionar lojas..."
          multiple
          onChange={(lojas) => {
            setLojaIdsFiltro(lojas.map((l) => l.id));
            setLojaNomesFiltro(lojas.map((l) => l.nome));
          }}
        />
        {(numeroFiltro || lojaNomesFiltro.length > 0) && (
          <TouchableOpacity style={styles.clearBtn} onPress={limparFiltros}>
            <Text style={styles.clearBtnText}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {tab === 'lancados' &&
        filtradosLancados.map((c: CanhotoLancadoDetalhe) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor[c.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor[c.status] }]}>
                  {statusLabel[c.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.loja}>{c.loja} · {c.usuario}</Text>
            <Text style={styles.data}>
              {c.data}
              {c.enviadoEm ? ` · Enviado ${c.enviadoEm}` : ''}
            </Text>
            {c.observacoes && <Text style={styles.obs}>{c.observacoes}</Text>}
          </View>
        ))}

      {tab === 'sistema' &&
        filtradosSistemaDisponiveis.map((c) => (
          <View key={`sist-${c.numero}`} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Disponível</Text>
              </View>
            </View>
            <Text style={styles.loja}>{c.nome_fantasia ?? '—'}</Text>
            <Text style={styles.data}>{c.data}{c.nfe ? ` · NFe ${c.nfe}` : ''}</Text>
            {c.total != null && (
              <Text style={styles.obs}>Total: R$ {c.total.toFixed(2)}</Text>
            )}
          </View>
        ))}

      {tab === 'atrasados' &&
        filtradosSistemaAtrasados.map((c) => (
          <View key={`atras-${c.numero}`} style={[styles.card, styles.cardAtrasado]}>
            <View style={styles.row}>
              <Text style={styles.numero}>{c.numero}</Text>
              <View style={[styles.badge, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.error }]}>Atrasado</Text>
              </View>
            </View>
            <Text style={styles.loja}>{c.nome_fantasia ?? '—'}</Text>
            <Text style={styles.data}>{c.data}{c.nfe ? ` · NFe ${c.nfe}` : ''}</Text>
            {c.total != null && (
              <Text style={styles.obs}>Total: R$ {c.total.toFixed(2)}</Text>
            )}
          </View>
        ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    padding: 2,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  filters: {
    marginBottom: spacing.md,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  clearBtnText: {
    ...typography.caption,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAtrasado: {
    borderColor: colors.error,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { ...typography.subtitle, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { fontSize: 12, fontWeight: '600' },
  loja: { ...typography.caption, color: colors.text, marginTop: 4 },
  data: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  obs: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
