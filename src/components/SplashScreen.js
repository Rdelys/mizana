// Splash simple et moderne : fond blanc, grand logo, nom stylé, barre en bas.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen({ ready, onDone }) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const nameIn = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    // Logo : fondu + léger zoom
    Animated.timing(logoIn, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Nom : apparition légèrement décalée
    Animated.timing(nameIn, {
      toValue: 1,
      duration: 600,
      delay: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Barre : progresse jusqu'à 85 % pendant la durée minimale
    Animated.timing(bar, {
      toValue: 0.85,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setMinDone(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand l'appli est prête : barre à 100 % puis fondu de sortie
  useEffect(() => {
    if (!ready || !minDone) return;
    Animated.timing(bar, { toValue: 1, duration: 300, useNativeDriver: false }).start(() => {
      Animated.timing(out, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        if (onDone) onDone();
      });
    });
  }, [ready, minDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: out }]}>
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: logoIn,
            transform: [{ scale: logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          }}
        >
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: nameIn,
            alignItems: 'center',
            marginTop: 22,
            transform: [{ translateY: nameIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          }}
        >
          <Text style={styles.name}>
            Miz<Text style={styles.nameAccent}>ana</Text>
          </Text>
          <View style={styles.underline} />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.track}>
          <Animated.View
            style={[styles.fill, { width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 48,
    paddingBottom: 64,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 220, height: 220 },
  name: {
    color: colors.primary,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  nameAccent: { color: colors.accent },
  underline: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 10,
  },
  footer: { alignItems: 'center' },
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
});