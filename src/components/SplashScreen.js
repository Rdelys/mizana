// Page de chargement : logo animé + barre de progression.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function SplashScreen({ ready, onDone }) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const [pct, setPct] = useState(0);
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const id = bar.addListener(({ value }) => setPct(Math.round(value * 100)));
    Animated.spring(logoIn, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
    Animated.timing(titleIn, { toValue: 1, duration: 700, delay: 500, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    Animated.timing(bar, {
      toValue: 0.85,
      duration: 1900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setMinDone(true));
    return () => {
      bar.removeListener(id);
      loop.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand l'appli est prête (et l'animation minimale finie) : barre à 100 % puis fondu
  useEffect(() => {
    if (!ready || !minDone) return;
    Animated.timing(bar, { toValue: 1, duration: 350, useNativeDriver: false }).start(() => {
      Animated.timing(out, { toValue: 0, duration: 450, delay: 150, useNativeDriver: true }).start(() => {
        if (onDone) onDone();
      });
    });
  }, [ready, minDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: out }]}>
      <LinearGradient colors={[colors.primary, colors.navy]} style={styles.root}>
        <View style={styles.blobRed} />
        <View style={styles.blobWhite} />

        <View style={styles.center}>
          <View style={styles.logoZone}>
            <Animated.View
              style={[
                styles.ring,
                {
                  opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                  transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.logoBox,
                {
                  opacity: logoIn,
                  transform: [{ scale: logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
                },
              ]}
            >
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          </View>

          <Animated.View
            style={{
              opacity: titleIn,
              alignItems: 'center',
              transform: [{ translateY: titleIn.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}
          >
            <Text style={styles.name}>Mizana</Text>
            <Text style={styles.tagline}>Bougez. Pesez. Progressez.</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.track}>
            <Animated.View
              style={[styles.fill, { width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
            />
          </View>
          <Text style={styles.pct}>Chargement… {pct}%</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 36, paddingBottom: 70 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoZone: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ring: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: '#FFFFFF' },
  logoBox: {
    width: 128,
    height: 128,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logo: { width: 84, height: 84 },
  name: { color: '#FFFFFF', fontSize: 40, fontWeight: '900', letterSpacing: 2 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 6, letterSpacing: 1 },
  footer: { alignItems: 'center' },
  track: { width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' },
  pct: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 10, fontWeight: '600' },
  blobRed: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accent,
    opacity: 0.9,
  },
  blobWhite: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFFFFF',
    opacity: 0.08,
  },
});