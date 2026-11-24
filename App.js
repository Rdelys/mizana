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
import SettingsScreen from './src/screens/SettingsScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';

const TABS = [
  { key: 'home', label: 'Accueil', icon: 'home' },
  { key: 'weigh', label: 'Pesée', icon: 'balance-scale' },
  { key: 'program', label: 'Programme', icon: 'calendar-alt' },
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
        style={[
          styles.iconWrap,
          active && styles.iconWrapActive,
          { transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] },
        ]}
      >
        <Icon name={t.icon} size={18} color={active ? '#FFFFFF' : colors.muted} />
      </Animated.View>
      <Text style={[styles.tabLabel, active && { color: colors.text, fontWeight: '800' }]}>{t.label}</Text>
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
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flex: 1 }}>
            {tab === 'home' && <HomeScreen today={today} nav={nav} />}
            {tab === 'weigh' && <WeighScreen today={today} />}
            {tab === 'program' && <ProgramScreen today={today} nav={nav} />}
            {tab === 'settings' && <SettingsScreen />}
          </View>
          <TabBar tab={tab} setTab={setTab} />
        </View>
      );
    }
  }

  // Icônes sombres sur le splash blanc, claires ensuite (tout le reste est sombre)
  const statusStyle = !splashDone ? 'dark' : 'light';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
    backgroundColor: '#0A1536',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  iconWrap: {
    width: 50, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.primary },
  tabLabel: { fontSize: 11, color: colors.muted, marginTop: 4 },
});