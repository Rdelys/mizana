// Composants d'interface réutilisables (FontAwesome + motion).
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '../theme';
import { FadeIn, PressScale } from './Motion';

export function Icon({ name, size = 18, color = colors.text, style }) {
  return <FontAwesome5 name={name} size={size} color={color} solid style={style} />;
}

// Chaque bloc enfant apparaît en cascade
export function Screen({ children, contentContainerStyle }) {
  const insets = useSafeAreaInsets();
  const items = React.Children.toArray(children);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[{ padding: 16, paddingBottom: 32 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {items.map((c, i) => (
          <FadeIn key={(c && c.key) || i} delay={Math.min(i, 9) * 55}>
            {c}
          </FadeIn>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Card({ children, style, tone }) {
  const toneStyle =
    tone === 'primary'
      ? { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, shadowOpacity: 0, elevation: 0 }
      : tone === 'accent'
      ? { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft, shadowOpacity: 0, elevation: 0 }
      : null;
  return <View style={[styles.card, toneStyle, style]}>{children}</View>;
}

export function GradientCard({ children, style, gradient = [colors.primary, colors.primaryDark] }) {
  return (
    <View style={[styles.gradWrap, style]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        {children}
      </LinearGradient>
    </View>
  );
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Heading({ children, style, icon, iconColor = colors.primary }) {
  if (!icon) return <Text style={[styles.heading, style]}>{children}</Text>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <View style={styles.headingIcon}>
        <Icon name={icon} size={13} color={iconColor} />
      </View>
      <Text style={[styles.heading, { marginBottom: 0, flex: 1 }, style]}>{children}</Text>
    </View>
  );
}

export function Body({ children, style, numberOfLines }) {
  return (
    <Text style={[styles.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Muted({ children, style }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

const buttonVariants = {
  primary: { bg: colors.primary, fg: '#FFFFFF', border: colors.primary },
  accent: { bg: colors.accent, fg: '#FFFFFF', border: colors.accent },
  secondary: { bg: colors.primarySoft, fg: colors.primaryDark, border: colors.primarySoft },
  ghost: { bg: 'transparent', fg: colors.muted, border: colors.border },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  light: { bg: '#FFFFFF', fg: colors.primary, border: '#FFFFFF' },
};

export function Button({ title, onPress, variant = 'primary', disabled, style, small, icon, loading }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  return (
    <PressScale onPress={onPress} disabled={disabled || loading} style={style}>
      <View
        style={[
          styles.button,
          small && styles.buttonSmall,
          { backgroundColor: v.bg, borderColor: v.border },
          disabled && { opacity: 0.45 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.fg} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={small ? 13 : 15} color={v.fg} style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text>
          </>
        )}
      </View>
    </PressScale>
  );
}

export function Chip({ label, selected, onPress, style, icon }) {
  return (
    <PressScale onPress={onPress} style={[{ marginRight: 8, marginBottom: 8 }, style]}>
      <View style={[styles.chip, selected && styles.chipSelected]}>
        {icon ? (
          <Icon name={icon} size={12} color={selected ? '#FFFFFF' : colors.primaryDark} style={{ marginRight: 6 }} />
        ) : null}
        <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

export function ProgressBar({ value, color = colors.primary, style }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: pct, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={[styles.progressTrack, style]}>
      <Animated.View
        style={[
          styles.progressFill,
          { backgroundColor: color, width: a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

export function Notice({ tone = 'info', children, style }) {
  const map = {
    info: { bg: colors.infoSoft, fg: colors.info, icon: 'info-circle' },
    warn: { bg: colors.warnSoft, fg: colors.warn, icon: 'exclamation-triangle' },
    good: { bg: colors.goodSoft, fg: colors.good, icon: 'check-circle' },
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'exclamation-circle' },
  };
  const t = map[tone] || map.info;
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }, style]}>
      <Icon name={t.icon} size={15} color={t.fg} style={{ marginRight: 10, marginTop: 3 }} />
      <Text style={{ color: t.fg, fontSize: 14, lineHeight: 20, flex: 1 }}>{children}</Text>
    </View>
  );
}

export function StatTile({ label, value, sub, tone, style }) {
  const color =
    tone === 'good' ? colors.good : tone === 'warn' ? colors.warn : tone === 'danger' ? colors.danger : colors.text;
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  keyboardType = 'decimal-pad',
  onEndEditing,
  secureTextEntry,
  autoCapitalize,
  style,
}) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          placeholder={placeholder}
          placeholderTextColor="#9AA9CC"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

// Choix d'une heure par pas de 15 minutes
export function TimeStepper({ label, value, onChange, step = 15, icon }) {
  const shift = (delta) => {
    const [h, m] = value.split(':').map(Number);
    let t = (h * 60 + m + delta) % 1440;
    if (t < 0) t += 1440;
    onChange(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  };
  return (
    <View style={styles.stepperRow}>
      {icon ? <Icon name={icon} size={15} color={colors.primary} style={{ width: 26 }} /> : null}
      <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => shift(-step)}>
        <Icon name="minus" size={13} color={colors.primaryDark} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => shift(step)}>
        <Icon name="plus" size={13} color={colors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  gradWrap: { borderRadius: radius.xl, marginBottom: 14, ...shadow, shadowOpacity: 0.25 },
  grad: { borderRadius: radius.xl, padding: 18, overflow: 'hidden' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  headingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  button: {
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: 12 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { color: colors.primaryDark, fontWeight: '700', fontSize: 14 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  notice: { flexDirection: 'row', borderRadius: radius.md, padding: 12, marginBottom: 10 },
  tile: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, marginHorizontal: 4 },
  tileLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  tileValue: { fontSize: 20, fontWeight: '800' },
  tileSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  fieldLabel: { fontSize: 13, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.text,
  },
  suffix: { marginLeft: 10, fontSize: 16, color: colors.muted, fontWeight: '600', minWidth: 28 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { width: 62, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.text },
});