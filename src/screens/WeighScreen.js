import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import LineChart from '../components/LineChart';
import {
  Body, Button, Field, Muted, Notice, ProgressBar, Row, Screen, Section, StatRow,
} from '../components/UI';
import { useApp } from '../context/AppContext';
import { computeStats, fmtKg, parseNum, round1, sortedWeighIns } from '../utils/calc';
import { addDays, formatDayMonth, formatLong, formatShortYear } from '../utils/dates';

export default function WeighScreen({ today }) {
  const { state, saveWeighIn, deleteWeighIn } = useApp();
  const { profile, weighIns } = state;

  const stats = useMemo(() => computeStats(profile, weighIns), [profile, weighIns]);
  const sorted = useMemo(() => sortedWeighIns(weighIns), [weighIns]);

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Préremplit avec la pesée existante du jour choisi, sinon avec la dernière valeur connue
  useEffect(() => {
    const existing = weighIns.find((w) => w.date === date);
    if (existing) {
      setWeight(String(existing.weight).replace('.', ','));
      setWaist(typeof existing.waist === 'number' ? String(existing.waist).replace('.', ',') : '');
    } else {
      const last = sorted.length ? sorted[sorted.length - 1] : null;
      setWeight(last ? String(last.weight).replace('.', ',') : '');
      setWaist('');
    }
    setError('');
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  const exists = weighIns.some((w) => w.date === date);

  const save = () => {
    const w = parseNum(weight);
    const wa = waist.trim() === '' ? null : parseNum(waist);
    if (!(w >= 30 && w <= 300)) return setError('Entrez un poids entre 30 et 300 kg.');
    if (wa !== null && !(wa >= 40 && wa <= 250)) return setError('Entrez un tour de taille entre 40 et 250 cm.');
    setError('');
    const entry = { date, weight: round1(w) };
    if (wa !== null) entry.waist = round1(wa);
    saveWeighIn(entry);
    setMessage('Pesée enregistrée ✓');
    setTimeout(() => setMessage(''), 3000);
  };

  const confirmDelete = (d) => {
    Alert.alert('Supprimer cette pesée ?', formatLong(d), [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteWeighIn(d) },
    ]);
  };

  const chartData = sorted.slice(-12).map((e) => ({ label: formatDayMonth(e.date), value: e.weight }));

  const toneColor = (tone) => (tone === 'good' ? 'good' : tone === 'warn' ? 'warn' : tone === 'danger' ? 'danger' : undefined);

  // Poids actuel dans l'en-tête bleu
  const hero = stats ? (
    <View>
      <Row style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 46, fontWeight: '800', color: '#FFFFFF' }}>{fmtKg(stats.last.weight)}</Text>
        <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginLeft: 6, marginBottom: 8 }}>kg</Text>
        {stats.deltaPrev !== null && (
          <Text style={{ marginLeft: 12, marginBottom: 10, fontWeight: '800', color: '#FFFFFF' }}>
            {fmtKg(stats.deltaPrev, true)} kg
          </Text>
        )}
      </Row>
      <ProgressBar value={stats.progress} color="#FFFFFF" trackColor="rgba(255,255,255,0.28)" style={{ marginVertical: 10 }} />
      <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13 }}>
        Objectif {fmtKg(profile.goalWeight)} kg · reste {fmtKg(stats.remaining)} kg · {Math.round(stats.progress * 100)} %
      </Text>
    </View>
  ) : (
    <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>Enregistrez votre première pesée ci-dessous.</Text>
  );

  return (
    <Screen title="Pesée" subtitle="Suivi de mon poids" hero={hero}>
      <Section title="Nouvelle pesée" icon="plus-circle">
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <Button title="◀" variant="secondary" small onPress={() => setDate(addDays(date, -1))} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', flex: 1 }}>
            {formatLong(date)}
          </Text>
          <Button
            title="▶"
            variant="secondary"
            small
            disabled={date >= today}
            onPress={() => setDate(addDays(date, 1))}
          />
        </Row>
        <Field label="Poids" value={weight} onChangeText={setWeight} suffix="kg" />
        <Field label="Tour de taille au nombril (facultatif)" value={waist} onChangeText={setWaist} suffix="cm" />
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {message ? <Notice tone="good">{message}</Notice> : null}
        <Button title={exists ? 'Mettre à jour cette pesée' : 'Enregistrer'} onPress={save} />
        <Muted style={{ marginTop: 10 }}>
          Conseil : chaque dimanche matin, à jeun, après être passé aux toilettes, avec la même balance.
        </Muted>
      </Section>

      {stats ? (
        <Section title="Courbe" icon="chart-line">
          <LineChart data={chartData} goal={profile.goalWeight} />
          {chartData.length < 2 && <Muted style={{ marginTop: 6 }}>La courbe apparaît dès la deuxième pesée.</Muted>}
        </Section>
      ) : null}

      {stats ? (
        <Section title="Mes calculs" icon="calculator">
          <StatRow
            style={{ marginBottom: 10 }}
            items={[
              { label: 'IMC', value: fmtKg(stats.bmi), sub: stats.bmiLabel, tone: toneColor(stats.bmiTone) },
              {
                label: 'Depuis la dernière',
                value: stats.deltaPrev === null ? '—' : `${fmtKg(stats.deltaPrev, true)} kg`,
                tone: stats.deltaPrev === null ? undefined : stats.deltaPrev <= 0 ? 'good' : 'warn',
              },
            ]}
          />
          <StatRow
            style={{ marginBottom: 12 }}
            items={[
              {
                label: 'Depuis le début',
                value: `${fmtKg(stats.deltaTotal, true)} kg`,
                tone: stats.deltaTotal <= 0 ? 'good' : 'warn',
              },
              {
                label: 'Rythme moyen',
                value: stats.perWeek === null ? '—' : `${fmtKg(stats.perWeek)} kg`,
                sub: stats.perWeek === null ? 'Il faut 1 semaine' : 'par semaine',
              },
            ]}
          />

          {stats.etaISO ? (
            <Body style={{ marginTop: 4 }}>
              Au rythme actuel, objectif vers le <Text style={{ fontWeight: '800' }}>{formatShortYear(stats.etaISO)}</Text>.
            </Body>
          ) : null}

          {stats.waist ? (
            <Body style={{ marginTop: 8 }}>
              Tour de taille : {fmtKg(stats.waist.last)} cm
              {stats.waist.delta !== null ? ` (${fmtKg(stats.waist.delta, true)} cm depuis le début)` : ''}
            </Body>
          ) : null}

          {stats.waist && stats.waist.risk ? (
            <Notice tone={stats.waist.risk.tone} style={{ marginTop: 10, marginBottom: 0 }}>
              Tour de taille : {stats.waist.risk.label.toLowerCase()}. Repère pour {profile.sex === 'femme' ? 'une femme' : 'un homme'} : moins de {stats.waist.risk.target} cm.
              {stats.waist.ratio >= 0.5 ? ` Rapport taille/hauteur ${stats.waist.ratio.toFixed(2).replace('.', ',')} (idéal : sous 0,5).` : ''}
            </Notice>
          ) : null}

          {stats.alerts.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              {stats.alerts.map((a, i) => (
                <Notice key={`alert${i}`} tone={a.tone}>
                  {a.text}
                </Notice>
              ))}
            </View>
          ) : null}
        </Section>
      ) : null}

      <Section title="Historique" icon="history">
        {sorted.length === 0 && <Muted>Aucune pesée pour le moment.</Muted>}
        {[...sorted].reverse().map((e, i, arr) => {
          const older = arr[i + 1];
          const delta = older ? e.weight - older.weight : null;
          return (
            <View
              key={e.date}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: i === arr.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Body>{formatShortYear(e.date)}</Body>
                {typeof e.waist === 'number' ? <Muted>Taille {fmtKg(e.waist)} cm</Muted> : null}
              </View>
              <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text }}>{fmtKg(e.weight)} kg</Text>
              <Text
                style={{
                  width: 62,
                  textAlign: 'right',
                  fontWeight: '700',
                  color: delta === null ? colors.muted : delta <= 0 ? colors.good : colors.warn,
                }}
              >
                {delta === null ? '' : fmtKg(delta, true)}
              </Text>
              <TouchableOpacity onPress={() => confirmDelete(e.date)} style={{ paddingLeft: 12, paddingVertical: 4 }}>
                <Text style={{ color: colors.muted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Section>
    </Screen>
  );
}