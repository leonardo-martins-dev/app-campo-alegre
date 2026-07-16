import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../core/auth/AuthContext';
import { getActionsForRole } from '../../core/config/actionsConfig';
import { getHubIcon } from '../../shared/icons/HubIcons';
import type { ChecklistColab } from '../../core/storage/storage';
import { fetchChecklistHoje, upsertChecklistHoje } from '../../core/api/checklist';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '../../app/navigation/types';
import { SCREEN_TO_TAB } from '../../app/navigation/screenToTabMap';
import { ClipboardCheck } from 'lucide-react-native';
import { countCanhotosEnviadosHoje } from '../../core/api/canhotos';

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<any, 'Hub'>,
    BottomTabNavigationProp<MainTabParamList>
  >;
};

/** Checklist v1 — só canhotos (procedimentos fora do escopo App Store) */
const COLAB_CHECKLIST_ITEMS = [
  {
    id: 'canhotos',
    title: 'Conferir e enviar canhotos',
    subtitle: 'Envie ao menos 1 canhoto para marcar',
    screen: 'Conferencia' as keyof RootStackParamList,
    icon: ClipboardCheck,
    color: colors.success,
    key: 'canhotos' as const,
  },
];

export default function HubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const role = user?.nivelAcesso ?? 'colaborador';
  const actions = getActionsForRole(role);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [checklist, setChecklistState] = useState<ChecklistColab | null>(null);
  const [confirmKey, setConfirmKey] = useState<'canhotos' | null>(null);
  const [canhotosHoje, setCanhotosHoje] = useState(0);
  const [registering, setRegistering] = useState(false);
  const isColaborador = role === 'colaborador';

  const loadChecklist = useCallback(async () => {
    if (!isColaborador || !user?.id) return;
    try {
      const data = await fetchChecklistHoje(user.id);
      setChecklistState(data);
    } catch {
      setChecklistState(null);
    }

    try {
      const count = await countCanhotosEnviadosHoje(user.id);
      setCanhotosHoje(count);
    } catch {
      setCanhotosHoje(0);
    }
  }, [isColaborador, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadChecklist();
    }, [loadChecklist])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleOpenScreen = useCallback(
    (screen: keyof RootStackParamList) => {
      const mapping = SCREEN_TO_TAB[screen];
      if (mapping) {
        const parent = navigation.getParent();
        (parent as any)?.navigate(mapping.tab, { screen: mapping.screen });
      } else {
        (navigation as any).navigate(screen);
      }
    },
    [navigation]
  );

  const handleCheckPress = useCallback(
    (key: 'canhotos') => {
      if (!isColaborador) return;
      if (checklist?.[key]) return;
      if (checklist?.registrado) return;

      if (key === 'canhotos' && canhotosHoje < 1) {
        Alert.alert(
          'Envie um canhoto primeiro',
          'Para marcar este item, registre pelo menos um canhoto hoje.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Enviar canhoto',
              onPress: () => handleOpenScreen('LancamentoCanhoto'),
            },
          ]
        );
        return;
      }

      setConfirmKey(key);
    },
    [isColaborador, checklist, canhotosHoje, handleOpenScreen]
  );

  const handleConfirmCheck = useCallback(async () => {
    if (!confirmKey || !user?.id) return;
    try {
      const next = await upsertChecklistHoje(user.id, user.lojaId, { [confirmKey]: true });
      setChecklistState(next);
      setConfirmKey(null);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível salvar o checklist.');
    }
  }, [confirmKey, user?.id, user?.lojaId]);

  const allChecked = Boolean(checklist?.canhotos);
  const alreadyRegistered = Boolean(checklist?.registrado);

  const handleRegistrarChecklist = useCallback(async () => {
    if (!allChecked || alreadyRegistered || registering || !user?.id) return;
    setRegistering(true);
    try {
      const next = await upsertChecklistHoje(user.id, user.lojaId, {
        registrado: true,
        registradoEm: new Date().toISOString(),
      });
      setChecklistState(next);
      Alert.alert('Checklist registrado', 'Seu checklist do dia foi salvo e já conta nas métricas.');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível registrar o checklist.');
    } finally {
      setRegistering(false);
    }
  }, [allChecked, alreadyRegistered, registering, user?.id, user?.lojaId]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  if (isColaborador) {
    const hoje = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>{hoje}</Text>
              <Text style={styles.heroTitle}>
                {greeting}
                {user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}
              </Text>
              <Text style={styles.heroSubtitle}>Checklist do dia</Text>
            </View>

            {COLAB_CHECKLIST_ITEMS.map((item) => {
              const checked = checklist?.[item.key] ?? false;
              const Icon = item.icon;
              const subtitle =
                canhotosHoje > 0
                  ? `${canhotosHoje} canhoto${canhotosHoje > 1 ? 's' : ''} enviado${canhotosHoje > 1 ? 's' : ''} hoje`
                  : item.subtitle;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.colabCard,
                    checked && styles.colabCardDone,
                    alreadyRegistered && styles.colabCardRegistered,
                  ]}
                  onPress={() => handleOpenScreen(item.screen)}
                  activeOpacity={0.9}
                >
                  <Pressable
                    style={styles.checkWrap}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleCheckPress(item.key);
                    }}
                    disabled={alreadyRegistered}
                  >
                    <View style={[styles.checkBig, checked && styles.checkBigDone]}>
                      {checked && <Text style={styles.checkBigText}>✓</Text>}
                    </View>
                  </Pressable>
                  <View style={styles.colabCardBody}>
                    <Text style={[styles.colabCardTitle, checked && styles.colabCardTitleDone]}>
                      {item.title}
                    </Text>
                    <Text style={styles.colabCardSubtitle}>{subtitle}</Text>
                    <View style={[styles.colabCardBadge, { backgroundColor: item.color + '18' }]}>
                      <Icon size={16} color={item.color} />
                      <Text style={[styles.colabCardBadgeText, { color: item.color }]}>
                        {checked ? 'Concluído' : canhotosHoje > 0 ? 'Pronto para marcar' : 'Enviar canhoto'}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.registrarBtn,
                (!allChecked || alreadyRegistered) && styles.registrarBtnDisabled,
                alreadyRegistered && styles.registrarBtnDone,
              ]}
              onPress={handleRegistrarChecklist}
              disabled={!allChecked || alreadyRegistered || registering}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.registrarBtnText,
                  (!allChecked || alreadyRegistered) && styles.registrarBtnTextDisabled,
                  alreadyRegistered && styles.registrarBtnTextDone,
                ]}
              >
                {alreadyRegistered
                  ? 'Checklist registrado ✓'
                  : registering
                    ? 'Registrando…'
                    : 'Registrar checklist'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <Modal visible={confirmKey !== null} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setConfirmKey(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Confirmar conclusão</Text>
              <Text style={styles.modalMessage}>
                Marcar como concluído? Não será possível desmarcar neste dia.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setConfirmKey(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnConfirm}
                  onPress={handleConfirmCheck}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>Módulos</Text>
            <Text style={styles.heroTitle}>
              {greeting}
              {user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.heroSubtitle}>Atalhos para as operações do dia</Text>
          </View>

          {actions.map((action) => {
            const Icon = getHubIcon(action.icon);
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.card}
                onPress={() => handleOpenScreen(action.screen as keyof RootStackParamList)}
                activeOpacity={0.88}
              >
                <View style={[styles.iconWrap, { backgroundColor: action.color + '18' }]}>
                  <Icon size={22} color={action.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{action.label}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {action.description}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroEyebrow: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heroTitle: {
    ...typography.title,
    color: colors.navy,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  colabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  colabCardDone: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '08',
  },
  colabCardRegistered: {
    opacity: 0.92,
  },
  checkWrap: {
    marginRight: spacing.md,
  },
  checkBig: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBigDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkBigText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  colabCardBody: {
    flex: 1,
  },
  colabCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  colabCardTitleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  colabCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3,
  },
  colabCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    gap: 5,
  },
  colabCardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registrarBtn: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  registrarBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  registrarBtnDone: {
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  registrarBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  registrarBtnTextDisabled: {
    color: colors.textMuted,
  },
  registrarBtnTextDone: {
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  modalBtnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalBtnConfirm: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    backgroundColor: colors.navy,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
