// Composants d'interface réutilisables (FontAwesome + motion).
// Style : fond bleu nuit, titres en gras italique, tranche rouge en diagonale.
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

const toneColor = (tone) =>
  tone === 'good' ? colors.good : tone === 'warn' ? colors.warn : tone === 'danger' ? colors.danger : colors.text;

export function Icon({ name, size = 18, color = colors.text, style }) {
  return <FontAwesome5 name={name} size={size} color={color} solid style={style} />;
}

// Page : en-tête bleu qui se fond dans le fond de la page, puis les blocs séparés par un fin trait.
// Sans "title" : ancien affichage (utilisé par l'écran de démarrage).
export function Screen({ children, title, subtitle, hero, right, contentContainerStyle }) {
  const insets = useSafeAreaInsets();
  const items = React.Children.toArray(children);

  if (!title) {
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
          {items}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryDark, '#0B1A4A', colors.bg]}
          locations={[0, 0.62, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.35, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 18 }]}
        >
          <View style={styles.slashA} />
          <View style={styles.slashB} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            {right}
          </View>
          {hero ? (
            <FadeIn style={{ marginTop: 18 }} distance={22} duration={500}>
              {hero}
            </FadeIn>
          ) : null}
        </LinearGradient>

        <View style={[styles.body, contentContainerStyle]}>
          {items.map((c, i) => (
            <View key={(c && c.key) || i} style={i > 0 ? styles.sep : null}>
              {c}
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Grand bloc vitré posé dans l'en-tête (séance du jour, poids actuel...)
export function HeroCard({ children, style }) {
  return <View style={[styles.heroCard, style]}>{children}</View>;
}

// Bloc d'une page : titre avec une barre rouge + contenu
export function Section({ title, icon, iconColor = colors.primaryLight, right, children, style }) {
  return (
    <View style={style}>
      {title ? (
        <View style={styles.sectionHead}>
          <View style={styles.sectionBar} />
          {icon ? <Icon name={icon} size={14} color={iconColor} style={{ marginRight: 8 }} /> : null}
          <Text style={styles.sectionTitle}>{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

// Zone teintée à l'intérieur d'une page
export function Panel({ children, style, tone }) {
  const map = {
    accent: { bg: colors.accentSoft, border: 'rgba(255,59,78,0.4)' },
    white: { bg: colors.card, border: colors.border },
    default: { bg: colors.primarySoft, border: colors.border },
  };
  const t = map[tone] || map.default;
  return <View style={[styles.panel, { backgroundColor: t.bg, borderColor: t.border }, style]}>{children}</View>;
}

export function Pill({ label, icon, light, style }) {
  const fg = light ? '#FFFFFF' : colors.primaryLight;
  return (
    <View style={[styles.pill, { backgroundColor: light ? 'rgba(255,255,255,0.16)' : colors.primarySoft }, style]}>
      {icon ? <Icon name={icon} size={11} color={fg} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color: fg, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

// Carte simple, utilisée par l'écran de démarrage
export function Card({ children, style, tone }) {
  const toneStyle =
    tone === 'primary'
      ? { backgroundColor: colors.primarySoft }
      : tone === 'accent'
      ? { backgroundColor: colors.accentSoft }
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

export function Heading({ children, style, icon, iconColor = colors.primaryLight }) {
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
  primary: { grad: [colors.primary, colors.primaryDark], fg: '#FFFFFF', border: 'transparent' },
  accent: { grad: ['#FF5A6A', colors.accent], fg: '#FFFFFF', border: 'transparent' },
  secondary: { bg: colors.primarySoft, fg: colors.primaryLight, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.muted, border: colors.border },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  light: { bg: '#FFFFFF', fg: colors.primaryDark, border: '#FFFFFF' },
};

export function Button({ title, onPress, variant = 'primary', disabled, style, small, icon, loading }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const content = loading ? (
    <ActivityIndicator color={v.fg} />
  ) : (
    <>
      {icon ? <Icon name={icon} size={small ? 13 : 15} color={v.fg} style={title ? { marginRight: 8 } : null} /> : null}
      {title ? <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text> : null}
    </>
  );
  const boxStyle = [
    styles.button,
    small && styles.buttonSmall,
    !v.grad && { backgroundColor: v.bg, borderColor: v.border, borderWidth: 1 },
    disabled && { opacity: 0.45 },
  ];
  return (
    <PressScale onPress={onPress} disabled={disabled || loading} style={style}>
      {v.grad ? (
        <LinearGradient colors={v.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={boxStyle}>
          {content}
        </LinearGradient>
      ) : (
        <View style={boxStyle}>{content}</View>
      )}
    </PressScale>
  );
}

export function Chip({ label, selected, onPress, style, icon }) {
  return (
    <PressScale onPress={onPress} style={[{ marginRight: 8, marginBottom: 8 }, style]}>
      <View style={[styles.chip, selected && styles.chipSelected]}>
        {icon ? (
          <Icon name={icon} size={12} color={selected ? '#FFFFFF' : colors.primaryLight} style={{ marginRight: 6 }} />
        ) : null}
        <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

export function ProgressBar({ value, color = colors.primary, trackColor = colors.border, style }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: pct, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }, style]}>
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
    <View style={[styles.notice, { backgroundColor: t.bg, borderLeftColor: t.fg }, style]}>
      <Icon name={t.icon} size={15} color={t.fg} style={{ marginRight: 10, marginTop: 3 }} />
      <Text style={{ color: t.fg, fontSize: 14, lineHeight: 20, flex: 1 }}>{children}</Text>
    </View>
  );
}

export function StatTile({ label, value, sub, tone, style }) {
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color: toneColor(tone) }]}>{value}</Text>
      {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
    </View>
  );
}

// Bandeau de chiffres séparés par de fines lignes
export function StatRow({ items, style }) {
  return (
    <View style={[styles.statRow, style]}>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.statCell, i > 0 && styles.statDivider]}>
          <Text style={styles.tileLabel}>{it.label}</Text>
          <Text style={[styles.tileValue, { color: toneColor(it.tone) }]} numberOfLines={1} adjustsFontSizeToFit>
            {it.value}
          </Text>
          {it.sub ? <Text style={styles.tileSub}>{it.sub}</Text> : null}
        </View>
      ))}
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
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
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
      {icon ? <Icon name={icon} size={15} color={colors.primaryLight} style={{ width: 26 }} /> : null}
      <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => shift(-step)}>
        <Icon name="minus" size={13} color={colors.primaryLight} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => shift(step)}>
        <Icon name="plus" size={13} color={colors.primaryLight} />
      </TouchableOpacity>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden' },
  slashA: {
    position: 'absolute', top: -90, right: -20, width: 120, height: 440,
    backgroundColor: colors.accent, opacity: 0.2, transform: [{ rotate: '24deg' }],
  },
  slashB: {
    position: 'absolute', top: -90, right: 74, width: 26, height: 440,
    backgroundColor: '#FFFFFF', opacity: 0.08, transform: [{ rotate: '24deg' }],
  },
  headerSub: { color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  headerTitle: {
    color: '#FFFFFF', fontSize: 34, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.8,
  },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 48 },
  sep: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 24, paddingTop: 24 },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 18,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionBar: {
    width: 5, height: 20, borderRadius: 2, backgroundColor: colors.accent, marginRight: 10,
    transform: [{ skewX: '-18deg' }],
  },
  sectionTitle: { flex: 1, fontSize: 19, fontWeight: '900', fontStyle: 'italic', color: colors.text, letterSpacing: -0.3 },
  panel: { borderRadius: radius.lg, padding: 14, borderWidth: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  gradWrap: { borderRadius: radius.xl, marginBottom: 14, ...shadow },
  grad: { borderRadius: radius.xl, padding: 18, overflow: 'hidden' },
  title: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', color: colors.text, letterSpacing: -0.6 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  headingIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  button: {
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonSmall: { paddingVertical: 10, paddingHorizontal: 14 },
  buttonText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.primaryLight, fontWeight: '700', fontSize: 14 },
  progressTrack: { height: 10, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  notice: { flexDirection: 'row', borderRadius: radius.md, padding: 12, marginBottom: 10, borderLeftWidth: 4 },
  tile: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, marginHorizontal: 4 },
  tileLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  tileValue: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.4 },
  tileSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statRow: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  statCell: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  fieldLabel: { fontSize: 13, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  suffix: { marginLeft: 10, fontSize: 16, color: colors.muted, fontWeight: '700', minWidth: 28 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepValue: { width: 62, textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.text },
});