import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { scheduleAll } from './src/notifications';
import { colors } from './src/theme';
import useToday from './src/utils/useToday';
import { Icon } from './src/components/UI';
import SplashScreen from './src/components/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import WeighScreen from './src/screens/WeighScreen';
import ProgramScreen from './src/screens/ProgramScreen';
import DrinksScreen from './src/screens/DrinksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';

const TABS = [
  { key: 'home', label: 'Accueil', icon: 'home' },
  { key: 'weigh', label: 'Pesée', icon: 'balance-scale' },
  { key: 'program', label: 'Programme', icon: 'calendar-alt' },
  { key: 'drinks', label: 'Boisson', icon: 'blender' },
  { key: 'settings', label: 'Réglages', icon: 'cog' },
];

function TabItem({ t, active, onPress }) {
  const a = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: active ? 1 : 0, friction: 6, useNativeDriver: true }).start();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
            { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        }}
      >
        <Icon name={t.icon} size={19} color={active ? colors.primary : colors.muted} />
        <Text style={[styles.tabLabel, active && { color: colors.primary, fontWeight: '800' }]}>{t.label}</Text>
      </Animated.View>
      <Animated.View style={[styles.dot, { opacity: a, transform: [{ scale: a }] }]} />
    </Pressable>
  );
}

function TabBar({ tab, setTab }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((t) => (
        <TabItem key={t.key} t={t} active={t.key === tab} onPress={() => setTab(t.key)} />
      ))}
    </View>
  );
}

function Root() {
  const { state, setSession } = useApp();
  const today = useToday();
  const [tab, setTab] = useState('home');
  const [workout, setWorkout] = useState(null);
  const [splashDone, setSplashDone] = useState(false);

  const hasProfile = !!(state.profile && state.profile.setupDone);

  useEffect(() => {
    if (!state.ready || !hasProfile) return undefined;
    const id = setTimeout(() => {
      scheduleAll(state.settings);
    }, 700);
    return () => clearTimeout(id);
  }, [state.ready, hasProfile, state.settings]);

  const nav = { setTab, startWorkout: (plan) => setWorkout(plan) };

  let content = null;
  if (state.ready) {
    if (!hasProfile) {
      content = <OnboardingScreen />;
    } else if (workout) {
      content = (
        <WorkoutScreen
          plan={workout}
          onClose={() => setWorkout(null)}
          onComplete={(feeling) => {
            const session = { status: 'done' };
            if (feeling) session.feeling = feeling;
            setSession(workout.date, session);
            setWorkout(null);
            setTab('home');
          }}
        />
      );
    } else {
      content = (
        <View style={{ flex: 1, backgroundColor: colors.primary }}>
          <View style={{ flex: 1 }}>
            {tab === 'home' && <HomeScreen today={today} nav={nav} />}
            {tab === 'weigh' && <WeighScreen today={today} />}
            {tab === 'program' && <ProgramScreen today={today} nav={nav} />}
            {tab === 'drinks' && <DrinksScreen today={today} nav={nav} />}
            {tab === 'settings' && <SettingsScreen />}
          </View>
          <TabBar tab={tab} setTab={setTab} />
        </View>
      );
    }
  }

  // Icônes claires sur les en-têtes bleus, sombres sur le splash blanc et l'écran de démarrage
  const statusStyle = !splashDone || !hasProfile ? 'dark' : 'light';

  return (
    <View style={{ flex: 1, backgroundColor: hasProfile ? colors.primary : colors.bg }}>
      <StatusBar style={statusStyle} />
      {content}
      {!splashDone && <SplashScreen ready={state.ready} onDone={() => setSplashDone(true)} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 11, color: colors.muted, marginTop: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 4 },
});