import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import LojaPicker from '../../shared/components/LojaPicker';
import { MOCK_CHECKLIST_QUEBRA } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { useAuth } from '../../core/auth/AuthContext';
import { enviarProcedimento, fetchChecklistTemplate } from '../../core/api/procedimentos';

type QuebraItem = { id: string; label: string; concluido: boolean; requiresPhoto?: boolean };

const defaultQuebraItens = (): QuebraItem[] =>
  MOCK_CHECKLIST_QUEBRA.map((i) => ({ ...i, requiresPhoto: i.id === '3' }));

export default function ProcedimentoQuebraScreen() {
  const { user } = useAuth();
  const [itens, setItens] = useState<QuebraItem[]>(defaultQuebraItens);
  const [loja, setLoja] = useState<{ id: string; nome: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChecklistTemplate('quebra')
      .then((template) => {
        setItens(
          template.map((i) => ({
            id: i.id,
            label: i.label,
            concluido: false,
            requiresPhoto: i.requiresPhoto,
          }))
        );
      })
      .catch(() => setItens(defaultQuebraItens()));
  }, []);

  const toggle = (id: string) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, concluido: !i.concluido } : i)));
  };

  const handleEnviar = async () => {
    if (!loja || !user?.id) {
      Alert.alert('Supermercado', 'Selecione o supermercado.');
      return;
    }
    setSubmitting(true);
    try {
      await enviarProcedimento({
        tipo: 'quebra',
        lojaId: loja.id,
        usuarioId: user.id,
        itens: itens.map((i) => ({
          id: i.id,
          label: i.label,
          concluido: i.concluido,
          requiresPhoto: !!i.requiresPhoto,
        })),
        fotos: {},
      });
      Alert.alert('Enviado', 'Procedimento de quebra registrado.');
      setItens((prev) => prev.map((i) => ({ ...i, concluido: false })));
      setLoja(null);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setSubmitting(false);
    }
  };

  const allDone = itens.every((i) => i.concluido);

  return (
    <ScreenLayout>
      <SectionTitle>Procedimento de quebra</SectionTitle>

      <LojaPicker
        label="Supermercado"
        placeholder="Selecionar supermercado"
        selectedIds={loja ? [loja.id] : []}
        multiple={false}
        onChange={(lojas) => setLoja(lojas[0] ?? null)}
      />

      <View style={styles.card}>
        {itens.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => toggle(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.check, item.concluido && styles.checkOk]}>
              {item.concluido && <Text style={styles.checkText}>✓</Text>}
            </View>
            <Text style={[styles.itemLabel, item.concluido && styles.labelDone]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, (!allDone || !loja || submitting) && styles.buttonDisabled]}
        onPress={handleEnviar}
        disabled={!allDone || !loja || submitting}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{submitting ? 'Enviando...' : 'Enviar procedimento'}</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkOk: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  itemLabel: { ...typography.body, color: colors.text, flex: 1, fontSize: 14 },
  labelDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  button: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { opacity: 0.5 },
});
