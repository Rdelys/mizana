import React, { useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { colors } from '../theme';
import {
  Body, Button, Chip, Field, Icon, Muted, Notice, Row, Screen, Section, TimeStepper,
} from '../components/UI';
import { useApp } from '../context/AppContext';
import { MODEL } from '../services/ai';
import { cancelAll, sendTestNotification } from '../notifications';
import { SEXES, fmtKg, parseNum, weightForBMI } from '../utils/calc';

const REMINDER_LABELS = [
  ['water', 'tint', 'Eau (5 rappels)'],
  ['lunchWalk', 'walking', 'Marche après le déjeuner'],
  ['workout', 'dumbbell', 'Séance du jour'],
  ['dinner', 'utensils', 'Dîner léger'],
  ['bedtime', 'moon', 'Coucher (2 rappels)'],
  ['weigh', 'balance-scale', 'Pesée du dimanche'],
];

export default function SettingsScreen() {
  const { state, saveProfile, updateSettings, setAiKey, reset } = useApp();
  const { profile, settings, aiKey } = state;

  const [height, setHeight] = useState(String(profile.heightCm).replace('.', ','));
  const [goal, setGoal] = useState(String(profile.goalWeight).replace('.', ','));
  const [key, setKey] = useState(aiKey || '');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const flash = (text) => {
    setInfo(text);
    setTimeout(() => setInfo(''), 3000);
  };

  const commitProfile = () => {
    const h = parseNum(height);
    const g = parseNum(goal);
    if (!(h >= 120 && h <= 230)) return setError('La taille doit être entre 120 et 230 cm.');
    const minSafe = weightForBMI(h, 18.5);
    if (!(g >= minSafe)) return setError(`Objectif trop bas pour votre taille. Minimum conseillé : ${fmtKg(minSafe)} kg.`);
    setError('');
    saveProfile({ heightCm: h, goalWeight: g });
    flash('Profil mis à jour ✓');
  };

  const test = async () => {
    const ok = await sendTestNotification();
    flash(
      ok
        ? 'Notification de test dans 5 secondes. Quittez l’app pour la voir.'
        : 'Impossible d’envoyer. Autorisez les notifications dans les réglages du téléphone.'
    );
  };

  const confirmReset = () => {
    Alert.alert('Tout effacer ?', 'Poids, séances, programme IA, boissons et réglages seront supprimés de ce téléphone. Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Tout effacer',
        style: 'destructive',
        onPress: async () => {
          await cancelAll();
          await reset();
        },
      },
    ]);
  };

  const heroCell = (label, value, first) => (
    <View
      style={{
        flex: 1, alignItems: 'center',
        borderLeftWidth: first ? 0 : 1, borderLeftColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );

  const hero = (
    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 18, paddingVertical: 14 }}>
      {heroCell('Taille', `${fmtKg(profile.heightCm)} cm`, true)}
      {heroCell('Départ', `${fmtKg(profile.startWeight)} kg`)}
      {heroCell('Objectif', `${fmtKg(profile.goalWeight)} kg`)}
    </View>
  );

  return (
    <Screen title="Réglages" subtitle="Mon profil et mes rappels" hero={hero}>
      <Section title="Mon profil" icon="user">
        <Muted style={{ marginBottom: 6 }}>Sexe (sert aux repères du tour de taille)</Muted>
        <Row style={{ marginBottom: 6 }}>
          {Object.entries(SEXES).map(([k, label]) => (
            <Chip key={k} label={label} selected={profile.sex === k} onPress={() => saveProfile({ sex: k })} />
          ))}
        </Row>
        <Field label="Taille" value={height} onChangeText={setHeight} onEndEditing={commitProfile} suffix="cm" />
        <Field label="Objectif de poids" value={goal} onChangeText={setGoal} onEndEditing={commitProfile} suffix="kg" />
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {info ? <Notice tone="good">{info}</Notice> : null}
        <Button title="Enregistrer le profil" variant="secondary" onPress={commitProfile} />
      </Section>

      <Section title="Intelligence artificielle" icon="robot" iconColor={colors.accent}>
        <Muted style={{ marginBottom: 10 }}>
          Collez votre clé API Anthropic (console.anthropic.com). Elle sert au programme sportif et aux boissons. Modèle utilisé : {MODEL}.
        </Muted>
        <Field
          label="Clé API Anthropic"
          value={key}
          onChangeText={setKey}
          keyboardType="default"
          secureTextEntry
          autoCapitalize="none"
          placeholder="sk-ant-..."
        />
        <Button
          title="Enregistrer la clé"
          icon="key"
          variant="secondary"
          onPress={() => {
            setAiKey(key.trim());
            flash(key.trim() ? 'Clé enregistrée ✓' : 'Clé supprimée');
          }}
        />
        <Notice tone="warn" style={{ marginTop: 12, marginBottom: 0 }}>
          La clé reste sur ce téléphone. Pour une application publiée, passez plutôt par votre propre serveur afin de ne jamais exposer la clé.
        </Notice>
      </Section>

      <Section title="Rappels" icon="bell">
        {REMINDER_LABELS.map(([k, icon, label]) => (
          <Row key={k} style={{ justifyContent: 'space-between', paddingVertical: 8 }}>
            <Icon name={icon} size={15} color={colors.primary} style={{ width: 28 }} />
            <Body style={{ flex: 1 }}>{label}</Body>
            <Switch
              value={!!settings.reminders[k]}
              onValueChange={(v) => updateSettings({ reminders: { [k]: v } })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Row>
        ))}
        <Muted style={{ marginTop: 6 }}>Les rappels sont recalculés automatiquement à chaque changement.</Muted>
        <Button title="Tester une notification" icon="bell" variant="secondary" onPress={test} style={{ marginTop: 12 }} />
      </Section>

      <Section title="Mes heures" icon="stopwatch">
        <TimeStepper icon="sun" label="Réveil" value={settings.times.wake} onChange={(v) => updateSettings({ times: { wake: v } })} />
        <TimeStepper icon="walking" label="Marche après déjeuner" value={settings.times.lunchWalk} onChange={(v) => updateSettings({ times: { lunchWalk: v } })} />
        <TimeStepper icon="dumbbell" label="Séance du jour" value={settings.times.workout} onChange={(v) => updateSettings({ times: { workout: v } })} />
        <TimeStepper icon="utensils" label="Dîner" value={settings.times.dinner} onChange={(v) => updateSettings({ times: { dinner: v } })} />
        <TimeStepper icon="moon" label="Coucher" value={settings.times.bedtime} onChange={(v) => updateSettings({ times: { bedtime: v } })} />
        <TimeStepper icon="balance-scale" label="Pesée du dimanche" value={settings.times.weigh} onChange={(v) => updateSettings({ times: { weigh: v } })} />
        <Muted style={{ marginTop: 8 }}>Chaque pas change l’heure de 15 minutes.</Muted>
      </Section>

      <Section title="Données" icon="database">
        <Muted style={{ marginBottom: 10 }}>
          Tout est enregistré uniquement sur ce téléphone (AsyncStorage). Si vous désinstallez l’application, les données sont perdues.
        </Muted>
        <Button title="Tout effacer et recommencer" icon="trash" variant="danger" onPress={confirmReset} />
      </Section>

      <Muted style={{ textAlign: 'center' }}>Mizana V2 · repères généraux, pas d’avis médical.</Muted>
    </Screen>
  );
}