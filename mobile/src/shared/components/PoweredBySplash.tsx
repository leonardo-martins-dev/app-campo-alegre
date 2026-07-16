import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import NoPontoLogo, { NOPONTO } from '../icons/NoPontoLogo';

type Props = {
  onFinish: () => void;
};

const FADE_IN = 700;
const HOLD = 1100;
const FADE_OUT = 550;

/**
 * Tela de transição premium ao abrir o app — "Powered by" + logo No Ponto.
 */
export default function PoweredBySplash({ onFinish }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const poweredOpacity = useSharedValue(0);
  const arcPulse = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  useEffect(() => {
    poweredOpacity.value = withDelay(
      120,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      280,
      withTiming(1, { duration: FADE_IN, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      280,
      withTiming(1, { duration: FADE_IN, easing: Easing.out(Easing.cubic) })
    );
    arcPulse.value = withDelay(
      500,
      withSequence(
        withTiming(1.04, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) })
      )
    );

    const total = 280 + FADE_IN + HOLD;
    exitOpacity.value = withDelay(
      total,
      withTiming(0, { duration: FADE_OUT, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, [arcPulse, exitOpacity, onFinish, opacity, poweredOpacity, scale]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  const poweredStyle = useAnimatedStyle(() => ({
    opacity: poweredOpacity.value,
    transform: [{ translateY: (1 - poweredOpacity.value) * 8 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * arcPulse.value }],
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <LinearGradient
        colors={[NOPONTO.navyDeep, NOPONTO.navy, '#0a5a82']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.content}>
        <Animated.Text style={[styles.powered, poweredStyle]}>Powered by</Animated.Text>
        <Animated.View style={logoStyle}>
          <NoPontoLogo width={260} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: NOPONTO.cyan,
    opacity: 0.08,
    alignSelf: 'center',
    top: '32%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  powered: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 28,
  },
});
