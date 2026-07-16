import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { Plus, Pencil } from 'lucide-react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { createLoja, fetchLojas, updateLoja } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';

const emptyForm = { nome: '', codigo: '', regiao: '', ativa: true };

export default function GestaoLojasScreen() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Loja | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (l: Loja) => {
    setEditing(l);
    setForm({
      nome: l.nome,
      codigo: l.codigo,
      regiao: l.regiao,
      ativa: l.ativa,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim() || !form.codigo.trim() || !form.regiao.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, código e região.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateLoja(editing.id, {
          nome: form.nome,
          codigo: form.codigo,
          regiao: form.regiao,
          ativa: form.ativa,
        });
        Alert.alert('Salvo', 'Loja atualizada.');
      } else {
        await createLoja({
          nome: form.nome,
          codigo: form.codigo,
          regiao: form.regiao,
        });
        Alert.alert('Criada', 'Loja cadastrada com sucesso.');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar loja.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtiva = (l: Loja) => {
    const next = !l.ativa;
    Alert.alert(
      next ? 'Reativar loja' : 'Desativar loja',
      next ? `Reativar ${l.nome}?` : `Desativar ${l.nome}? Ela não aparecerá para novos vínculos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: next ? 'Reativar' : 'Desativar',
          style: next ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateLoja(l.id, { ativa: next });
              await load();
            } catch (e) {
              Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao atualizar.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.headerRow}>
        <SectionTitle subtitle="Editar e ativar/desativar">Lojas</SectionTitle>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>Nova</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
      ) : (
        lojas.map((l) => (
          <View key={l.id} style={[styles.card, !l.ativa && styles.cardInativa]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{l.nome}</Text>
                <Text style={styles.codigo}>
                  {l.codigo} · {l.regiao}
                </Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(l)}>
                <Pencil size={16} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <View style={[styles.badge, l.ativa ? styles.badgeAtiva : styles.badgeInativa]}>
                <Text style={styles.badgeText}>{l.ativa ? 'Ativa' : 'Inativa'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggleAtiva(l)}>
                <Text style={styles.toggleText}>{l.ativa ? 'Desativar' : 'Reativar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editing ? 'Editar loja' : 'Nova loja'}</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(nome) => setForm((p) => ({ ...p, nome }))}
                placeholder="Loja Centro"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Código</Text>
              <TextInput
                style={styles.input}
                value={form.codigo}
                onChangeText={(codigo) => setForm((p) => ({ ...p, codigo }))}
                placeholder="LC-01"
                autoCapitalize="characters"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Região</Text>
              <TextInput
                style={styles.input}
                value={form.regiao}
                onChangeText={(regiao) => setForm((p) => ({ ...p, regiao }))}
                placeholder="Centro"
                placeholderTextColor={colors.textMuted}
              />

              {editing ? (
                <View style={styles.switchRow}>
                  <Text style={styles.labelInline}>Loja ativa</Text>
                  <Switch
                    value={form.ativa}
                    onValueChange={(ativa) => setForm((p) => ({ ...p, ativa }))}
                    trackColor={{ true: colors.navy }}
                  />
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>{editing ? 'Salvar' : 'Criar loja'}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  cardInativa: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nome: { fontSize: 16, fontWeight: '700', color: colors.navy },
  codigo: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full },
  badgeAtiva: { backgroundColor: colors.success + '20' },
  badgeInativa: { backgroundColor: colors.border },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.text },
  toggleText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
  labelInline: { ...typography.body, color: colors.navy, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
});
