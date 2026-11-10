// Petites animations réutilisables (Animated natif, sans bibliothèque en plus).
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

export function FadeIn({ children, delay = 0, distance = 18, duration = 450, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View
      style={[
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function PressScale({ children, onPress, disabled, style, to = 0.96 }) {
  const s = useRef(new Animated.Value(1)).current;
  const go = (val) => Animated.spring(s, { toValue: val, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return (
    <Pressable onPress={onPress} disabled={disabled} onPressIn={() => go(to)} onPressOut={() => go(1)} style={style}>
      <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>
    </Pressable>
  );
}

// Valeur qui va et vient en boucle (0 -> 1 -> 0)
export function useLoop(duration = 1200) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

export function Float({ children, distance = 8, duration = 1400, style }) {
  const v = useLoop(duration);
  return (
    <Animated.View
      style={[{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }] }, style]}
    >
      {children}
    </Animated.View>
  );
}

export function Pulse({ children, scale = 1.08, duration = 900, style }) {
  const v = useLoop(duration);
  return (
    <Animated.View
      style={[{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) }] }, style]}
    >
      {children}
    </Animated.View>
  );
}