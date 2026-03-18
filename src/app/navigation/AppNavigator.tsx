import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../../core/auth/AuthContext';
import type { RootStackParamList, RootNavigatorParamList, MainTabParamList } from './types';
import { TABS_BY_ROLE, TAB_LABELS, type TabName } from './tabsConfig';
import CustomHeader from '../../shared/components/CustomHeader';
import { colors, spacing } from '../../shared/theme';

import LoginScreen from '../../features/login/LoginScreen';
import HubScreen from '../../features/hub/HubScreen';
import LoadingScreen from '../../shared/components/LoadingScreen';
import LancamentoCanhotoScreen from '../../features/canhotos/LancamentoCanhotoScreen';
import VisualizacaoCanhotosScreen from '../../features/canhotos/VisualizacaoCanhotosScreen';
import ConferenciaScreen from '../../features/conferencia/ConferenciaScreen';
import ConferenciaPorLojaScreen from '../../features/conferencia/ConferenciaPorLojaScreen';
import ProcedimentosPromotoresScreen from '../../features/procedimentos/ProcedimentosPromotoresScreen';
import VisualizacaoProcedimentosScreen from '../../features/procedimentos/VisualizacaoProcedimentosScreen';
import ProcedimentoQuebraScreen from '../../features/procedimentos/ProcedimentoQuebraScreen';
import VisualizacaoQuebraScreen from '../../features/procedimentos/VisualizacaoQuebraScreen';
import GestaoUsuariosScreen from '../../features/gestao/GestaoUsuariosScreen';
import GestaoLojasScreen from '../../features/gestao/GestaoLojasScreen';
import UploadSistemaScreen from '../../features/gestao/UploadSistemaScreen';
import DashboardScreen from '../../features/dashboard/DashboardScreen';
import ImportadorPedidosScreen from '../../features/importador/ImportadorPedidosScreen';

import { Home, ClipboardCheck, CheckSquare, Settings, MoreHorizontal } from 'lucide-react-native';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const headerOptions = {
  header: () => <CustomHeader />,
  headerShadowVisible: false,
};

function InicioStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Hub" component={HubScreen} />
    </Stack.Navigator>
  );
}

function CanhotosStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Conferencia" component={ConferenciaScreen} />
      <Stack.Screen name="ConferenciaPorLoja" component={ConferenciaPorLojaScreen} />
      <Stack.Screen name="LancamentoCanhoto" component={LancamentoCanhotoScreen} />
      <Stack.Screen name="VisualizacaoCanhotos" component={VisualizacaoCanhotosScreen} />
    </Stack.Navigator>
  );
}

function ProcedimentosStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="ProcedimentosPromotores" component={ProcedimentosPromotoresScreen} />
      <Stack.Screen name="ProcedimentoQuebra" component={ProcedimentoQuebraScreen} />
      <Stack.Screen name="VisualizacaoProcedimentos" component={VisualizacaoProcedimentosScreen} />
      <Stack.Screen name="VisualizacaoQuebra" component={VisualizacaoQuebraScreen} />
    </Stack.Navigator>
  );
}

function GestaoStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="GestaoUsuarios" component={GestaoUsuariosScreen} />
      <Stack.Screen name="GestaoLojas" component={GestaoLojasScreen} />
      <Stack.Screen name="UploadSistema" component={UploadSistemaScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function MaisStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="ImportadorPedidos" component={ImportadorPedidosScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const role = user?.nivelAcesso ?? 'colaborador';
  const tabs = TABS_BY_ROLE[role];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}
    >
      {tabs.includes('Inicio') && (
        <Tab.Screen
          name="Inicio"
          component={InicioStack}
          options={{
            title: TAB_LABELS.Inicio,
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
      )}
      {tabs.includes('Canhotos') && (
        <Tab.Screen
          name="Canhotos"
          component={CanhotosStack}
          options={{
            title: TAB_LABELS.Canhotos,
            tabBarIcon: ({ color, size }) => <ClipboardCheck size={size} color={color} />,
          }}
        />
      )}
      {tabs.includes('Procedimentos') && (
        <Tab.Screen
          name="Procedimentos"
          component={ProcedimentosStack}
          options={{
            title: TAB_LABELS.Procedimentos,
            tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
          }}
        />
      )}
      {tabs.includes('Gestao') && (
        <Tab.Screen
          name="Gestao"
          component={GestaoStack}
          options={{
            title: TAB_LABELS.Gestao,
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      )}
      {tabs.includes('Mais') && (
        <Tab.Screen
          name="Mais"
          component={MaisStack}
          options={{
            title: TAB_LABELS.Mais,
            tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Login" component={LoginScreen} />
      ) : (
        <RootStack.Screen name="Main" component={MainTabs} />
      )}
    </RootStack.Navigator>
  );
}
