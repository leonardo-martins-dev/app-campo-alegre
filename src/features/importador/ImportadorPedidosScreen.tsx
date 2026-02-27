import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

const STEPS = ['Importar planilha', 'Vincular códigos', 'Exportar'];

export default function ImportadorPedidosScreen() {
  const [step, setStep] = useState(1);

  return (
    <ScreenLayout>
      <SectionTitle>Importador de pedidos</SectionTitle>
      <View style={styles.steps}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepRow}>
            <View style={[styles.stepDot, i + 1 <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i + 1 <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i + 1 === step && styles.stepLabelActive]}>{label}</Text>
            {i < STEPS.length - 1 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>
      <View style={styles.card}>
        {step === 1 && (
          <>
            <Text style={styles.cardTitle}>Passo 1: Importar</Text>
            <Text style={styles.cardDesc}>Selecione a planilha com NRO_EMPRESA, SEQPRODUTO, DESCCOMPLETA, QTD_SOLICITADA.</Text>
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Selecionar arquivo</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.cardTitle}>Passo 2: Vincular</Text>
            <Text style={styles.cardDesc}>Preencha ou confira COD_PRODUTO e COD_SUPER por item. Dados mockados.</Text>
            <TouchableOpacity style={styles.button} onPress={() => setStep(3)} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.cardTitle}>Passo 3: Exportar</Text>
            <Text style={styles.cardDesc}>Planilha enriquecida pronta para download.</Text>
            <TouchableOpacity style={styles.button} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Exportar planilha</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => setStep(1)}>
              <Text style={styles.linkText}>Começar de novo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  steps: { marginBottom: spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  stepNumActive: { color: '#fff' },
  stepLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  stepLabelActive: { color: colors.text, fontWeight: '600' },
  stepLine: { width: 1, height: 16, backgroundColor: colors.border, marginLeft: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { ...typography.subtitle, color: colors.text },
  cardDesc: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: 14 },
});
