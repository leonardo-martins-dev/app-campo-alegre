import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { MOCK_CHECKLIST_QUEBRA, MOCK_LOJAS } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { ChevronDown } from 'lucide-react-native';

export default function ProcedimentoQuebraScreen() {
  const [itens, setItens] = useState(MOCK_CHECKLIST_QUEBRA);
  const [loja, setLoja] = useState<{ id: string; nome: string } | null>(null);
  const [lojaModalVisible, setLojaModalVisible] = useState(false);

  const lojasAtivas = MOCK_LOJAS.filter((l) => l.ativa);

  const toggle = (id: string) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, concluido: !i.concluido } : i)));
  };

  return (
    <ScreenLayout>
      <SectionTitle>Procedimento de quebra</SectionTitle>

      <Text style={styles.fieldLabel}>Supermercado</Text>
      <Pressable style={styles.selectTrigger} onPress={() => setLojaModalVisible(true)}>
        <Text style={loja ? styles.selectTriggerText : styles.selectTriggerPlaceholder}>
          {loja ? loja.nome : 'Selecionar supermercado'}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={lojaModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setLojaModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Supermercado</Text>
            <ScrollView style={styles.lojaList}>
              {lojasAtivas.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={styles.lojaOption}
                  onPress={() => {
                    setLoja({ id: l.id, nome: l.nome });
                    setLojaModalVisible(false);
                  }}
                >
                  <Text style={styles.lojaOptionText}>{l.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setLojaModalVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
            <Text style={[styles.label, item.concluido && styles.labelDone]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Enviar procedimento de quebra</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
    marginBottom: spacing.md,
  },
  selectTriggerText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  selectTriggerPlaceholder: { fontSize: 15, color: colors.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lojaList: { maxHeight: 280 },
  lojaOption: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lojaOptionText: { fontSize: 16, color: colors.text },
  modalClose: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalCloseText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkOk: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  label: { ...typography.body, color: colors.text, flex: 1 },
  labelDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  button: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
