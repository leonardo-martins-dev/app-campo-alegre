import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

type Props = {
  /** Quantidade de cards placeholder */
  count?: number;
  /** Variante visual: resumo de loja (stats) ou lista de canhotos */
  variant?: 'loja' | 'canhoto';
};

function Bone({ style }: { style?: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.bone, style, { opacity }]} />;
}

export default function ListSkeleton({ count = 3, variant = 'loja' }: Props) {
  return (
    <View style={styles.wrap} accessibilityLabel="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          {variant === 'loja' ? (
            <>
              <Bone style={styles.title} />
              <View style={styles.stats}>
                <Bone style={styles.stat} />
                <Bone style={styles.stat} />
                <Bone style={styles.stat} />
              </View>
              <Bone style={styles.footer} />
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Bone style={styles.numero} />
                <Bone style={styles.badge} />
              </View>
              <Bone style={styles.line} />
              <Bone style={styles.lineShort} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bone: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
  },
  title: { height: 16, width: '55%', marginBottom: 4 },
  stats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
  stat: { flex: 1, height: 44 },
  footer: { height: 12, width: '40%', marginTop: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { height: 18, width: 90 },
  badge: { height: 22, width: 72, borderRadius: borderRadius.full },
  line: { height: 12, width: '45%', marginTop: 10 },
  lineShort: { height: 10, width: '30%', marginTop: 8 },
});
