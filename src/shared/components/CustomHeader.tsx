import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import HeaderLogout from './HeaderLogout';
import HeaderNotification from './HeaderNotification';

const HEADER_BAR_HEIGHT = 56;

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const canGoBack = navigation.canGoBack();
  const isHub = route.name === 'Hub';

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {canGoBack ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              hitSlop={12}
            >
              <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
            </Pressable>
          ) : isHub ? (
            <HeaderLogout />
          ) : null}
        </View>
        <View style={styles.right}>
          <HeaderNotification count={3} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_BAR_HEIGHT,
    paddingHorizontal: spacing.md,
  },
  left: {
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: spacing.md,
  },
  right: {
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.sm,
  },
  backBtn: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
