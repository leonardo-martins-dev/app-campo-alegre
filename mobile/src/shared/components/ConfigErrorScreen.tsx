import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { PRIVACY_POLICY_URL } from '../../core/config/constants';
import { colors, spacing, typography } from '../theme';

export default function ConfigErrorScreen() {
  const showPrivacy =
    PRIVACY_POLICY_URL && !PRIVACY_POLICY_URL.includes('seu-dominio');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App não configurado</Text>
      <Text style={styles.message}>
        Este build de produção requer conexão com o servidor. Entre em contato com a administração
        ou reinstale a versão oficial quando disponível.
      </Text>
      {showPrivacy && (
        <Text style={styles.link} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
          Política de privacidade
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  link: {
    marginTop: spacing.lg,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
