import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

export default function UploadSistemaScreen() {
  const [arquivo, setArquivo] = useState<string | null>(null);

  return (
    <ScreenLayout>
      <SectionTitle>Upload em massa</SectionTitle>
      <TouchableOpacity
        style={[styles.area, arquivo && styles.areaFilled]}
        onPress={() => setArquivo(arquivo ? null : 'planilha_canhotos.xlsx')}
        activeOpacity={0.85}
      >
        <Text style={styles.areaIcon}>📁</Text>
        <Text style={styles.areaText}>
          {arquivo ? arquivo : 'Toque para selecionar arquivo .xls ou .xlsx'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Arquivos com dados de canhotos para importação. Dados mockados.</Text>
      {arquivo && (
        <TouchableOpacity style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Processar importação</Text>
        </TouchableOpacity>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  area: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  areaFilled: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  areaIcon: { fontSize: 32, marginBottom: spacing.sm },
  areaText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  hint: { ...typography.small, color: colors.textSecondary, marginTop: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
