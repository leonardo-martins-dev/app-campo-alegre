import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Search, Check } from 'lucide-react-native';
import { fetchLojas } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../theme';

export type LojaOption = { id: string; nome: string };

type Props = {
  selectedIds: string[];
  onChange: (lojas: LojaOption[]) => void;
  label?: string;
  placeholder?: string;
  /** Se false, seleciona uma só e fecha. Default true. */
  multiple?: boolean;
};

/**
 * Seletor de lojas ativas com busca.
 * Teclado só aparece ao tocar no campo de busca (sem autoFocus).
 */
export default function LojaPicker({
  selectedIds,
  onChange,
  label = 'Loja',
  placeholder = 'Selecionar loja',
  multiple = true,
}: Props) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>([]);

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

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const draftSet = useMemo(() => new Set(draftIds), [draftIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lojas;
    return lojas.filter((l) => l.nome.toLowerCase().includes(q));
  }, [lojas, query]);

  const displayLabel = useMemo(() => {
    if (selectedIds.length === 0) return placeholder;
    const nomes = lojas.filter((l) => selectedSet.has(l.id)).map((l) => l.nome);
    if (nomes.length === 0) return placeholder;
    if (nomes.length === 1) return nomes[0];
    if (nomes.length === 2) return nomes.join(', ');
    return `${nomes[0]} +${nomes.length - 1}`;
  }, [selectedIds, lojas, selectedSet, placeholder]);

  const openModal = () => {
    setQuery('');
    setDraftIds([...selectedIds]);
    setOpen(true);
  };

  const toggleId = (id: string) => {
    if (!multiple) {
      const loja = lojas.find((l) => l.id === id);
      if (loja) {
        onChange([{ id: loja.id, nome: loja.nome }]);
        setOpen(false);
      }
      return;
    }
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const apply = () => {
    const selected = lojas
      .filter((l) => draftSet.has(l.id))
      .map((l) => ({ id: l.id, nome: l.nome }));
    onChange(selected);
    setOpen(false);
  };

  const clearAll = () => {
    if (multiple) {
      setDraftIds([]);
    } else {
      onChange([]);
      setOpen(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.trigger} onPress={openModal}>
        <Text
          style={[styles.triggerText, selectedIds.length === 0 && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{label}</Text>
            {multiple && (
              <Text style={styles.hint}>Selecione uma ou mais lojas</Text>
            )}

            <View style={styles.searchRow}>
              <Search size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar loja..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus={false}
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>

            {loading ? (
              <ActivityIndicator color={colors.navy} style={{ marginVertical: 24 }} />
            ) : (
              <ScrollView
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                keyboardDismissMode="on-drag"
              >
                {filtered.length === 0 ? (
                  <Text style={styles.empty}>Nenhuma loja encontrada</Text>
                ) : (
                  filtered.map((l) => {
                    const checked = multiple ? draftSet.has(l.id) : selectedSet.has(l.id);
                    return (
                      <TouchableOpacity
                        key={l.id}
                        style={[styles.option, checked && styles.optionSelected]}
                        onPress={() => toggleId(l.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>{l.nome}</Text>
                        {checked && <Check size={18} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={clearAll}>
                <Text style={styles.secondaryBtnText}>Limpar</Text>
              </TouchableOpacity>
              {multiple ? (
                <TouchableOpacity style={styles.primaryBtn} onPress={apply}>
                  <Text style={styles.primaryBtnText}>
                    {draftIds.length === 0
                      ? 'Aplicar'
                      : `Aplicar (${draftIds.length})`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setOpen(false)}>
                  <Text style={styles.primaryBtnText}>Fechar</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  hint: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
    backgroundColor: colors.surface,
  },
  triggerText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500', marginRight: 8 },
  triggerPlaceholder: { color: colors.textSecondary, fontWeight: '400' },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxHeight: '80%',
  },
  title: { ...typography.subtitle, color: colors.navy, marginBottom: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  list: { maxHeight: 360 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionSelected: { backgroundColor: colors.primary + '14' },
  optionText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500', marginRight: 8 },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.textSecondary, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.navy,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});
