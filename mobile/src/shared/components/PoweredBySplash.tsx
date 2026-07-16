import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import NoPontoLogo, { NOPONTO } from '../icons/NoPontoLogo';

type Props = {
  onFinish: () => void;
};

/** Entrada rápida: ~1.2s total */
const IN = 280;
const HOLD = 520;
const OUT = 320;

/**
 * Splash concisa — Powered by + No Ponto.
 */
export default function PoweredBySplash({ onFinish }: Props) {
  const content = useSharedValue(0);
  const screen = useSharedValue(1);

  useEffect(() => {
    content.value = withTiming(1, { duration: IN, easing: Easing.out(Easing.cubic) });
    screen.value = withDelay(
      IN + HOLD,
      withTiming(0, { duration: OUT, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, [content, onFinish, screen]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screen.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [{ translateY: (1 - content.value) * 10 }],
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]} pointerEvents="none">
      <LinearGradient
        colors={[NOPONTO.navyDeep, NOPONTO.navy]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.powered}>Powered by</Text>
        <NoPontoLogo width={200} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  powered: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
});
