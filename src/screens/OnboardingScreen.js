import React, { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Card, Chip, Field, Heading, Muted, Notice, Row, Screen, Title } from '../components/UI';
import { SEXES } from '../utils/calc';
import { bmi, fmtKg, parseNum, weightForBMI } from '../utils/calc';
import { todayISO } from '../utils/dates';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { saveProfile, saveWeighIn } = useApp();
  const [sex, setSex] = useState(null);
  const [height, setHeight] = useState('176');
  const [weight, setWeight] = useState('93');
  const [goal, setGoal] = useState('85');
  const [waist, setWaist] = useState('');
  const [error, setError] = useState('');

  const h = parseNum(height);
  const w = parseNum(weight);
  const preview = h > 0 && w > 0 ? bmi(w, h) : null;

  const submit = () => {
    const g = parseNum(goal);
    const wa = waist.trim() === '' ? null : parseNum(waist);

    if (!sex) return setError('Choisissez Homme ou Femme.');
    if (!(h >= 120 && h <= 230)) return setError('La taille doit être entre 120 et 230 cm.');
    if (!(w >= 30 && w <= 300)) return setError('Le poids doit être entre 30 et 300 kg.');
    if (!(g >= 30 && g < w)) return setError('L’objectif doit être inférieur à votre poids actuel.');
    const minSafe = weightForBMI(h, 18.5);
    if (g < minSafe) {
      return setError(`Cet objectif est trop bas pour votre taille. Minimum conseillé : ${fmtKg(minSafe)} kg.`);
    }
    if (wa !== null && !(wa >= 40 && wa <= 250)) return setError('Le tour de taille doit être entre 40 et 250 cm.');

    const today = todayISO();
    saveProfile({ sex, heightCm: h, startWeight: w, goalWeight: g, startDate: today, setupDone: true });
    const entry = { date: today, weight: w };
    if (wa !== null) entry.waist = wa;
    saveWeighIn(entry);
  };

  return (
    <Screen>
      <View style={{ marginTop: 12, marginBottom: 16 }}>
        <Title>Mizana</Title>
        <Muted style={{ marginTop: 4 }}>Pesée, séances du jour et rappels. Vos données restent sur ce téléphone.</Muted>
      </View>

      <Card>
        <Heading>Votre point de départ</Heading>
        <Muted style={{ marginBottom: 6 }}>Vous êtes</Muted>
        <Row style={{ marginBottom: 6 }}>
          {Object.entries(SEXES).map(([key, label]) => (
            <Chip key={key} label={label} selected={sex === key} onPress={() => setSex(key)} />
          ))}
        </Row>
        <Field label="Taille" value={height} onChangeText={setHeight} suffix="cm" />
        <Field label="Poids actuel" value={weight} onChangeText={setWeight} suffix="kg" />
        <Field label="Objectif de poids" value={goal} onChangeText={setGoal} suffix="kg" />
        <Field
          label="Tour de taille au nombril (facultatif)"
          value={waist}
          onChangeText={setWaist}
          suffix="cm"
          placeholder="ex. 104"
        />
        {preview !== null && (
          <Body style={{ marginBottom: 8 }}>IMC actuel : {fmtKg(preview)}</Body>
        )}
        {error ? <Notice tone="danger">{error}</Notice> : null}
        <Button title="Commencer" onPress={submit} />
      </Card>

      <Notice tone="info">
        Mizana donne des repères généraux, pas un avis médical. En cas de maladie, de douleur ou de traitement, parlez-en d’abord à un médecin.
      </Notice>
    </Screen>
  );
}
