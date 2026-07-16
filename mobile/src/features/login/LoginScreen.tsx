import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../core/auth/AuthContext';
import NoPontoLogo, { NOPONTO } from '../../shared/icons/NoPontoLogo';
import { spacing } from '../../shared/theme';

const CREAM = '#F5F0E6';
const FOREST = '#1B4332';
const FOREST_MUTED = 'rgba(27, 67, 50, 0.55)';
const SCREEN_H = Dimensions.get('window').height;

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !senha) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), senha);
    setLoading(false);
    if (result.success) return;
    setError(result.error ?? 'Erro ao entrar.');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[NOPONTO.navyDeep, NOPONTO.navy, '#0d5f88']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + SCREEN_H * 0.08,
              paddingBottom: insets.bottom + 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.brandEyebrow}>OPERAÇÕES DE CAMPO</Text>
            <Text style={styles.brandTitle}>Campo Alegre</Text>
            <Text style={styles.brandSubtitle}>Acesse com as credenciais da sua equipe</Text>
          </View>

          {/* View estática — Animated/transform no pai quebra o teclado no iOS */}
          <View style={styles.panel}>
            <Text style={styles.panelLabel}>Entrar</Text>

            <View style={[styles.field, emailFocused && styles.fieldFocused]}>
              <Mail size={18} color={emailFocused ? NOPONTO.cyan : FOREST_MUTED} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={FOREST_MUTED}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={[styles.field, senhaFocused && styles.fieldFocused]}>
              <Lock size={18} color={senhaFocused ? NOPONTO.cyan : FOREST_MUTED} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={FOREST_MUTED}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                editable={!loading}
                onFocus={() => setSenhaFocused(true)}
                onBlur={() => setSenhaFocused(false)}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff size={18} color={FOREST_MUTED} strokeWidth={2} />
                ) : (
                  <Eye size={18} color={FOREST_MUTED} strokeWidth={2} />
                )}
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={['#00B8F5', NOPONTO.cyan, '#0090C5']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={NOPONTO.white} />
                ) : (
                  <Text style={styles.buttonText}>Continuar</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Text style={styles.hint}>
              Use o e-mail e senha fornecidos pela administração.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerPowered}>Powered by</Text>
            <NoPontoLogo width={140} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NOPONTO.navy,
  },
  flex: {
    flex: 1,
  },
  orbTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: NOPONTO.cyan,
    opacity: 0.07,
    top: -80,
    right: -100,
  },
  orbBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#1B4332',
    opacity: 0.18,
    bottom: -40,
    left: -80,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  brandEyebrow: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.8,
    marginBottom: 10,
  },
  brandTitle: {
    color: CREAM,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    maxWidth: 280,
  },
  panel: {
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 12,
  },
  panelLabel: {
    color: FOREST,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 67, 50, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 12,
  },
  fieldFocused: {
    borderColor: NOPONTO.cyan,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: FOREST,
    paddingVertical: 14,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 2,
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: NOPONTO.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 17,
    color: FOREST_MUTED,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  footerPowered: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
});
