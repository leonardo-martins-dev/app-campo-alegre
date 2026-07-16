import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import HeaderLogout from './HeaderLogout';
import { useAuth } from '../../core/auth/AuthContext';

const HEADER_BAR_HEIGHT = 52;

const ROUTE_TITLES: Record<string, string> = {
  Hub: 'Início',
  Conferencia: 'Conferência',
  ConferenciaPorLoja: 'Por loja',
  LancamentoCanhoto: 'Novo canhoto',
  VisualizacaoCanhotos: 'Canhotos',
  GestaoUsuarios: 'Usuários',
  GestaoLojas: 'Lojas',
  Dashboard: 'Dashboard',
  ProcedimentosPromotores: 'Procedimentos',
  ProcedimentoQuebra: 'Quebra',
  VisualizacaoProcedimentos: 'Procedimentos',
  VisualizacaoQuebra: 'Quebras',
  UploadSistema: 'Upload',
  ImportadorPedidos: 'Importador',
};

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const canGoBack = navigation.canGoBack();
  const isHub = route.name === 'Hub';
  const title = ROUTE_TITLES[route.name] ?? '';

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {canGoBack ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={12}
            >
              <ChevronLeft size={24} color={colors.navy} strokeWidth={2.2} />
            </Pressable>
          ) : isHub ? (
            <HeaderLogout />
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        <View style={styles.center}>
          {isHub ? (
            <View style={styles.hubTitleWrap}>
              <Text style={styles.hubBrand} numberOfLines={1}>
                Campo Alegre
              </Text>
              {user?.nome ? (
                <Text style={styles.hubUser} numberOfLines={1}>
                  {user.nome}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        <View style={styles.right} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEADER_BAR_HEIGHT,
    paddingHorizontal: spacing.md,
  },
  left: {
    width: 72,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 72,
  },
  spacer: {
    width: 40,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  hubTitleWrap: {
    alignItems: 'center',
  },
  hubBrand: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  hubUser: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
