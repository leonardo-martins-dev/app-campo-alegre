import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Plus, Pencil, Trash2, UserX } from 'lucide-react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import {
  createUsuario,
  deleteUsuario,
  deactivateUsuario,
  fetchUsuarios,
  updateUsuario,
  type UsuarioDetalhe,
} from '../../core/api/profiles';
import { fetchLojas } from '../../core/api/lojas';
import type { Loja } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { useAuth } from '../../core/auth/AuthContext';

type NivelCriacao = 'colaborador' | 'supervisor' | 'administracao';

const NIVEIS: { value: NivelCriacao; label: string }[] = [
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'administracao', label: 'Administrador' },
];

const emptyForm = {
  nome: '',
  email: '',
  telefone: '',
  nivel_acesso: 'colaborador' as NivelCriacao,
  loja_ids: [] as string[],
  ativo: true,
};

export default function GestaoUsuariosScreen() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioDetalhe[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioDetalhe | null>(null);
  const [form, setForm] = useState(emptyForm);

  const needsLojas = form.nivel_acesso === 'colaborador' || form.nivel_acesso === 'supervisor';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([fetchUsuarios(), fetchLojas(true)]);
      setUsuarios(u);
      setLojas(l.filter((x) => x.ativa) );
    } catch {
      setUsuarios([]);
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

  const openEdit = (u: UsuarioDetalhe) => {
    setEditing(u);
    setForm({
      nome: u.nome,
      email: u.email,
      telefone: u.telefone ?? '',
      nivel_acesso: (['colaborador', 'supervisor', 'administracao'].includes(u.nivelAcesso)
        ? u.nivelAcesso
        : 'colaborador') as NivelCriacao,
      loja_ids: u.lojaIds,
      ativo: u.ativo,
    });
    setModalOpen(true);
  };

  const toggleLoja = (id: string) => {
    setForm((prev) => ({
      ...prev,
      loja_ids: prev.loja_ids.includes(id)
        ? prev.loja_ids.filter((x) => x !== id)
        : [...prev.loja_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.nome.trim() || (!editing && !form.email.trim())) {
      Alert.alert('Campos obrigatórios', 'Informe nome e e-mail.');
      return;
    }
    if (needsLojas && form.loja_ids.length === 0) {
      Alert.alert('Lojas', 'Selecione ao menos uma loja para colaborador/supervisor.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateUsuario({
          user_id: editing.id,
          nome: form.nome.trim(),
          telefone: form.telefone.trim() || null,
          nivel_acesso: form.nivel_acesso,
          loja_ids: needsLojas ? form.loja_ids : [],
          ativo: form.ativo,
        });
        Alert.alert('Salvo', 'Usuário atualizado.');
      } else {
        const result = await createUsuario({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim() || undefined,
          nivel_acesso: form.nivel_acesso,
          loja_ids: needsLojas ? form.loja_ids : [],
        });
        Alert.alert(
          'Usuário criado',
          `E-mail: ${result.email}\nSenha temporária: ${result.temporary_password}\n\nAnote e compartilhe com o usuário.`
        );
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (u: UsuarioDetalhe) => {
    if (u.id === user?.id) {
      Alert.alert('Ação inválida', 'Você não pode desativar a si mesmo.');
      return;
    }
    Alert.alert('Desativar usuário', `Desativar ${u.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivateUsuario(u.id);
            await load();
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao desativar.');
          }
        },
      },
    ]);
  };

  const handleDelete = (u: UsuarioDetalhe) => {
    if (u.id === user?.id) {
      Alert.alert('Ação inválida', 'Você não pode apagar a si mesmo.');
      return;
    }
    Alert.alert('Apagar usuário', `Apagar permanentemente ${u.nome}? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUsuario(u.id);
            await load();
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao apagar.');
          }
        },
      },
    ]);
  };

  const sorted = useMemo(
    () => [...usuarios].sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome)),
    [usuarios]
  );

  return (
    <ScreenLayout>
      <View style={styles.headerRow}>
        <SectionTitle subtitle="Criar, editar e remover acessos">Usuários</SectionTitle>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
      ) : (
        sorted.map((u) => (
          <View key={u.id} style={[styles.card, !u.ativo && styles.cardInativo]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{u.nome}</Text>
                <Text style={styles.email}>{u.email}</Text>
                {u.telefone ? <Text style={styles.meta}>{u.telefone}</Text> : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(u)}>
                  <Pencil size={16} color={colors.navy} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeactivate(u)}>
                  <UserX size={16} color={colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(u)}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={[styles.badge, u.ativo ? styles.badgeAtivo : styles.badgeInativo]}>
                <Text style={styles.badgeText}>{u.nivel}</Text>
              </View>
              {u.loja ? <Text style={styles.loja}>{u.loja}</Text> : null}
              <Text style={[styles.ativo, !u.ativo && styles.ativoOff]}>{u.ativo ? 'Ativo' : 'Inativo'}</Text>
            </View>
          </View>
        ))
      )}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editing ? 'Editar usuário' : 'Novo usuário'}</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(nome) => setForm((p) => ({ ...p, nome }))}
                placeholder="Nome completo"
                placeholderTextColor={colors.textMuted}
              />

              {!editing ? (
                <>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    value={form.email}
                    onChangeText={(email) => setForm((p) => ({ ...p, email }))}
                    placeholder="email@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={colors.textMuted}
                  />
                </>
              ) : null}

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={form.telefone}
                onChangeText={(telefone) => setForm((p) => ({ ...p, telefone }))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Nível de permissão</Text>
              <View style={styles.nivelRow}>
                {NIVEIS.map((n) => (
                  <TouchableOpacity
                    key={n.value}
                    style={[styles.nivelChip, form.nivel_acesso === n.value && styles.nivelChipOn]}
                    onPress={() => setForm((p) => ({ ...p, nivel_acesso: n.value, loja_ids: n.value === 'administracao' ? [] : p.loja_ids }))}
                  >
                    <Text style={[styles.nivelChipText, form.nivel_acesso === n.value && styles.nivelChipTextOn]}>
                      {n.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {needsLojas ? (
                <>
                  <Text style={styles.label}>Lojas vinculadas</Text>
                  <Text style={styles.hint}>Selecione uma ou mais lojas</Text>
                  {lojas.map((l) => {
                    const on = form.loja_ids.includes(l.id);
                    return (
                      <TouchableOpacity
                        key={l.id}
                        style={[styles.lojaChip, on && styles.lojaChipOn]}
                        onPress={() => toggleLoja(l.id)}
                      >
                        <Text style={[styles.lojaChipText, on && styles.lojaChipTextOn]}>
                          {on ? '✓ ' : ''}
                          {l.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : null}

              {editing ? (
                <View style={styles.switchRow}>
                  <Text style={styles.labelInline}>Usuário ativo</Text>
                  <Switch
                    value={form.ativo}
                    onValueChange={(ativo) => setForm((p) => ({ ...p, ativo }))}
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
                  <Text style={styles.saveBtnText}>{editing ? 'Salvar' : 'Criar usuário'}</Text>
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
  cardInativo: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', gap: spacing.sm },
  nome: { fontSize: 16, fontWeight: '700', color: colors.navy },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  meta: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full },
  badgeAtivo: { backgroundColor: colors.primary + '18' },
  badgeInativo: { backgroundColor: colors.border },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.navy },
  loja: { ...typography.small, color: colors.textSecondary, flex: 1 },
  ativo: { ...typography.small, color: colors.success },
  ativoOff: { color: colors.textMuted },
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
  hint: { ...typography.small, color: colors.textMuted, marginBottom: 8 },
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
  nivelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nivelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nivelChipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  nivelChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  nivelChipTextOn: { color: '#fff' },
  lojaChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  lojaChipOn: { backgroundColor: colors.primary + '18', borderColor: colors.primary },
  lojaChipText: { fontSize: 14, color: colors.text },
  lojaChipTextOn: { color: colors.navy, fontWeight: '600' },
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
