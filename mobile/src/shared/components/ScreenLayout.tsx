import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  noScroll?: boolean;
  contentContainerStyle?: ViewStyle;
}

export default function ScreenLayout({ children, noScroll, contentContainerStyle }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  };

  if (noScroll) {
    return <View style={[styles.container, padding]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, padding, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
});
