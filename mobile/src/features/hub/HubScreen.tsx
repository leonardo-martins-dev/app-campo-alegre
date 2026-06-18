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
import { useAuth } from '../../core/auth/AuthContext';
import { getActionsForRole } from '../../core/config/actionsConfig';
import { getHubIcon } from '../../shared/icons/HubIcons';
import { getChecklistColab, setChecklistColab, type ChecklistColab } from '../../core/storage/storage';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import type { HubAction } from '../../core/config/actionsConfig';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '../../app/navigation/types';
import { SCREEN_TO_TAB } from '../../app/navigation/screenToTabMap';
import { ClipboardCheck, CheckSquare, AlertTriangle } from 'lucide-react-native';

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<any, 'Hub'>,
    BottomTabNavigationProp<MainTabParamList>
  >;
};

const NIVEL_LABEL: Record<string, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  administracao: 'Administração',
  admin: 'Admin',
};

/** Checklist diário para colaborador: id, título, tela, ícone, cor, chave no estado */
const COLAB_CHECKLIST_ITEMS = [
  {
    id: 'canhotos',
    title: 'Conferir e enviar canhotos',
    subtitle: 'Ver situação e enviar seus canhotos',
    screen: 'Conferencia' as keyof RootStackParamList,
    icon: ClipboardCheck,
    color: '#10b981',
    key: 'canhotos' as const,
  },
  {
    id: 'procedimento',
    title: 'Procedimento',
    subtitle: 'Checklist diário do promotor',
    screen: 'ProcedimentosPromotores' as keyof RootStackParamList,
    icon: CheckSquare,
    color: '#f59e0b',
    key: 'procedimento' as const,
  },
  {
    id: 'quebra',
    title: 'Procedimento de quebra',
    subtitle: 'Registrar quebras e devoluções',
    screen: 'ProcedimentoQuebra' as keyof RootStackParamList,
    icon: AlertTriangle,
    color: '#ef4444',
    key: 'quebra' as const,
  },
];

export default function HubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const role = user?.nivelAcesso ?? 'colaborador';
  const actions = getActionsForRole(role);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [checklist, setChecklistState] = useState<ChecklistColab | null>(null);
  const [confirmKey, setConfirmKey] = useState<'canhotos' | 'procedimento' | 'quebra' | null>(null);
  const isColaborador = role === 'colaborador';

  const loadChecklist = useCallback(async () => {
    if (!isColaborador) return;
    const data = await getChecklistColab();
    setChecklistState(data);
  }, [isColaborador]);

  useFocusEffect(
    useCallback(() => {
      loadChecklist();
    }, [loadChecklist])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleCheckPress = useCallback(
    (key: 'canhotos' | 'procedimento' | 'quebra') => {
      if (!isColaborador) return;
      if (checklist?.[key]) return;
      setConfirmKey(key);
    },
    [isColaborador, checklist]
  );

  const handleConfirmCheck = useCallback(async () => {
    if (!confirmKey) return;
    const next = await setChecklistColab({ [confirmKey]: true });
    setChecklistState(next);
    setConfirmKey(null);
  }, [confirmKey]);

  const allChecked = Boolean(
    checklist?.canhotos && checklist?.procedimento && checklist?.quebra
  );

  const handleRegistrarChecklist = useCallback(() => {
    if (!allChecked) return;
    Alert.alert('Checklist registrado', 'Seu checklist do dia foi registrado com sucesso.', [
      { text: 'OK' },
    ]);
  }, [allChecked]);

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

  if (isColaborador) {
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.checklistTitle}>Checklist do dia</Text>
            <Text style={styles.checklistDate}>{hoje}</Text>

            {COLAB_CHECKLIST_ITEMS.map((item) => {
              const checked = checklist?.[item.key] ?? false;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.colabCard, checked && styles.colabCardDone]}
                  onPress={() => handleOpenScreen(item.screen)}
                  activeOpacity={0.9}
                >
                  <Pressable
                    style={styles.checkWrap}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCheckPress(item.key);
                    }}
                  >
                    <View style={[styles.checkBig, checked && styles.checkBigDone]}>
                      {checked && <Text style={styles.checkBigText}>✓</Text>}
                    </View>
                  </Pressable>
                  <View style={styles.colabCardBody}>
                    <Text style={[styles.colabCardTitle, checked && styles.colabCardTitleDone]}>
                      {item.title}
                    </Text>
                    <Text style={styles.colabCardSubtitle}>{item.subtitle}</Text>
                    <View style={[styles.colabCardBadge, { backgroundColor: item.color + '20' }]}>
                      <Icon size={18} color={item.color} />
                      <Text style={[styles.colabCardBadgeText, { color: item.color }]}>
                        {checked ? 'Feito' : 'Tocar para abrir'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.registrarBtn, !allChecked && styles.registrarBtnDisabled]}
              onPress={handleRegistrarChecklist}
              disabled={!allChecked}
              activeOpacity={0.85}
            >
              <Text style={[styles.registrarBtnText, !allChecked && styles.registrarBtnTextDisabled]}>
                Registrar checklist
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <Modal visible={confirmKey !== null} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setConfirmKey(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Confirmar conclusão</Text>
              <Text style={styles.modalMessage}>
                Deseja marcar "{confirmKey ? COLAB_CHECKLIST_ITEMS.find((i) => i.key === confirmKey)?.title : ''}" como concluído? Após confirmar, não será possível desmarcar neste dia.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setConfirmKey(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnConfirm}
                  onPress={handleConfirmCheck}
                  activeOpacity={0.8}
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
      <Text style={styles.sectionTitle}>Módulos disponíveis</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {actions.map((action) => {
            const Icon = getHubIcon(action.icon);
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.card}
                onPress={() => handleOpenScreen(action.screen as keyof RootStackParamList)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconWrap, { backgroundColor: action.color + '20' }]}>
                  <Icon size={28} color={action.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{action.label}</Text>
                  <Text style={styles.cardDesc}>{action.description}</Text>
                </View>
                <View style={styles.arrow} />
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
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textSecondary,
    transform: [{ rotate: '-45deg' }],
    marginLeft: spacing.sm,
  },
  // Colaborador checklist
  checklistTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  checklistDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  colabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  colabCardDone: {
    borderColor: colors.success + '60',
    backgroundColor: colors.success + '08',
  },
  checkWrap: {
    marginRight: spacing.md,
  },
  checkBig: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBigDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkBigText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  colabCardBody: {
    flex: 1,
  },
  colabCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  colabCardTitleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  colabCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  colabCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    gap: 4,
  },
  colabCardBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  registrarBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  registrarBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.7,
  },
  registrarBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  registrarBtnTextDisabled: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  modalBtnCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalBtnConfirm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
