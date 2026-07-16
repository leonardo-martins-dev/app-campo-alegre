import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../core/auth/AuthContext';
import NoPontoLogo, { NOPONTO } from '../../shared/icons/NoPontoLogo';
import { spacing } from '../../shared/theme';

const CREAM = '#F5F0E6';
const FOREST = '#1B4332';
const FOREST_MUTED = 'rgba(27, 67, 50, 0.55)';

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

  const heroOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    formOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })
    );
  }, [formOpacity, heroOpacity]);

  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOpacity.value }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: (1 - formOpacity.value) * 18 }],
  }));

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.hero, heroStyle]}>
            <Text style={styles.brandEyebrow}>OPERAÇÕES DE CAMPO</Text>
            <Text style={styles.brandTitle}>Campo Alegre</Text>
            <Text style={styles.brandSubtitle}>Acesse com as credenciais da sua equipe</Text>
          </Animated.View>

          <Animated.View style={[styles.panel, formStyle]}>
            <Text style={styles.panelLabel}>Entrar</Text>

            <View
              style={[
                styles.field,
                emailFocused && styles.fieldFocused,
                error && !email.trim() && styles.fieldError,
              ]}
            >
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
                textContentType="username"
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View
              style={[
                styles.field,
                senhaFocused && styles.fieldFocused,
                error && !senha && styles.fieldError,
              ]}
            >
              <Lock size={18} color={senhaFocused ? NOPONTO.cyan : FOREST_MUTED} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={FOREST_MUTED}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
                textContentType="password"
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

            {error ? (
              <Animated.Text entering={FadeInDown.duration(280)} style={styles.error}>
                {error}
              </Animated.Text>
            ) : null}

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
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.footer}
          >
            <Text style={styles.footerPowered}>Powered by</Text>
            <NoPontoLogo width={140} />
          </Animated.View>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  hero: {
    marginBottom: 28,
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
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 67, 50, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    marginBottom: 12,
  },
  fieldFocused: {
    borderColor: NOPONTO.cyan,
    backgroundColor: '#fff',
    shadowColor: NOPONTO.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  fieldError: {
    borderColor: 'rgba(239, 68, 68, 0.55)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: FOREST,
    paddingVertical: Platform.OS === 'ios' ? 0 : 10,
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
    transform: [{ scale: 0.985 }],
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
    marginTop: 36,
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
