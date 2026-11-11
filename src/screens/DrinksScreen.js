import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Body, Button, Chip, Icon, Muted, Notice, Panel, Pill, Row, Screen, Section } from '../components/UI';
import { useApp } from '../context/AppContext';
import { computeLevel } from '../data/program';
import { generateDrinks } from '../services/drinks';
import { addDays, formatShort } from '../utils/dates';

const DAYS = [1, 2, 3];
const MODES = [
  { key: 'maison', label: 'Je prépare', icon: 'blender' },
  { key: 'acheter', label: 'J’achète', icon: 'shopping-basket' },
  { key: 'both', label: 'Les deux', icon: 'random' },
];
const TYPE_LABEL = { mixer: 'À mixer', presser: 'À presser', infusion: 'Infusion', acheter: 'À acheter' };

export default function DrinksScreen({ today }) {
  const { state, setAiDrinks } = useApp();
  const { profile, weighIns, sessions, aiKey, aiDrinks } = state;

  const [daysChoice, setDaysChoice] = useState(1);
  const [mode, setMode] = useState('maison');
  const [sel, setSel] = useState(null);
  const [gen, setGen] = useState({ running: false, error: '' });
  const abortRef = useRef(null);

  const { level } = useMemo(
    () => computeLevel(sessions, profile.startDate, today),
    [sessions, profile.startDate, today]
  );

  const drinks = aiDrinks && aiDrinks.drinks ? aiDrinks.drinks : {};
  const dates = Object.keys(drinks).sort();
  const current = dates.includes(sel) ? sel : dates.includes(today) ? today : dates[0] || null;
  const drink = current ? drinks[current] : null;
  const todayDrink = drinks[today] || null;

  // Liste de courses de toutes les boissons du plan
  const shopping = useMemo(() => {
    const map = {};
    Object.keys(drinks).sort().forEach((d) => {
      (drinks[d].ingredients || []).forEach((ing) => {
        const k = ing.item.toLowerCase();
        if (!map[k]) map[k] = { item: ing.item, qty: [] };
        if (ing.qty) map[k].qty.push(ing.qty);
      });
    });
    return Object.values(map);
  }, [aiDrinks]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    if (!aiKey) {
      setGen({ running: false, error: 'Ajoutez d’abord votre clé Anthropic dans Réglages.' });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setGen({ running: true, error: '' });
    try {
      const plan = await generateDrinks({
        apiKey: aiKey, profile, weighIns, level,
        startDate: today, days: daysChoice, mode,
        avoid: Object.keys(drinks).map((d) => drinks[d].name),
        signal: controller.signal,
      });
      setAiDrinks(plan);
      setSel(today);
      setGen({ running: false, error: '' });
    } catch (e) {
      setGen({
        running: false,
        error: e && e.name === 'AbortError' ? '' : (e && e.message) || 'Erreur inconnue.',
      });
    }
  };

  const cancel = () => abortRef.current && abortRef.current.abort();

  const dayLabel = (d) => (d === today ? 'Aujourd’hui' : d === addDays(today, 1) ? 'Demain' : formatShort(d));

  const hero = todayDrink ? (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 22, padding: 16 }}>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>
        BOISSON DU JOUR
      </Text>
      <Row style={{ marginTop: 12 }}>
        <View style={styles.heroIcon}>
          <Icon name={todayDrink.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>{todayDrink.name}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 2 }}>
            {todayDrink.when}{todayDrink.minutes ? ` · ${todayDrink.minutes} min` : ''}
          </Text>
        </View>
      </Row>
    </View>
  ) : (
    <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22 }}>
      Des boissons 100 % naturelles, sans sucre ajouté, pour accompagner vos séances. Choisissez 1, 2 ou 3 jours et laissez l’IA composer vos recettes.
    </Text>
  );

  return (
    <Screen title="Boisson" subtitle="Brûle-graisse naturel" hero={hero}>
      {/* Générateur */}
      <Section title="Créer mes boissons" icon="magic" iconColor={colors.accent}>
        {aiDrinks ? (
          <Muted style={{ marginBottom: 8 }}>
            En cours : du {formatShort(aiDrinks.startDate)} au {formatShort(aiDrinks.endDate)} ({aiDrinks.days} jour{aiDrinks.days > 1 ? 's' : ''}).
          </Muted>
        ) : null}

        <Muted style={{ marginBottom: 6 }}>Pour combien de jours ?</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          {DAYS.map((n) => (
            <Chip
              key={n}
              label={n === 1 ? '1 jour' : `${n} jours`}
              selected={daysChoice === n}
              onPress={() => !gen.running && setDaysChoice(n)}
            />
          ))}
        </Row>

        <Muted style={{ marginBottom: 6 }}>Comment la boire ?</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          {MODES.map((m) => (
            <Chip
              key={m.key}
              label={m.label}
              icon={m.icon}
              selected={mode === m.key}
              onPress={() => !gen.running && setMode(m.key)}
            />
          ))}
        </Row>

        {!aiKey ? <Notice tone="warn">Clé Anthropic manquante. Ajoutez-la dans Réglages pour activer l’IA.</Notice> : null}
        {gen.error ? <Notice tone="danger">{gen.error}</Notice> : null}

        {gen.running ? (
          <>
            <Button title="Création des recettes…" variant="accent" loading />
            <Button title="Annuler" variant="ghost" small onPress={cancel} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <Button
              title={aiDrinks ? 'Générer de nouvelles boissons' : 'Générer avec l’IA'}
              icon="magic"
              variant="accent"
              onPress={generate}
            />
            {aiDrinks ? (
              <Button
                title="Effacer les boissons"
                variant="ghost"
                small
                icon="trash"
                onPress={() => setAiDrinks(null)}
                style={{ marginTop: 8 }}
              />
            ) : null}
          </>
        )}
      </Section>

      {/* Recette du jour choisi */}
      {drink ? (
        <Section title="Ma recette" icon="book-open">
          <Row style={{ flexWrap: 'wrap' }}>
            {dates.map((d) => (
              <Chip key={d} label={dayLabel(d)} selected={d === current} onPress={() => setSel(d)} />
            ))}
          </Row>

          <Row style={{ marginTop: 6, marginBottom: 6 }}>
            <View style={styles.drinkIcon}>
              <Icon name={drink.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.drinkName}>{drink.name}</Text>
              <Muted>
                {drink.when}{drink.minutes ? ` · ${drink.minutes} min` : ''}
              </Muted>
            </View>
            <Pill label={TYPE_LABEL[drink.type] || 'Boisson'} />
          </Row>

          {drink.goal ? (
            <Panel style={{ marginTop: 8 }}>
              <Body>{drink.goal}</Body>
            </Panel>
          ) : null}

          {drink.ingredients.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Body style={{ fontWeight: '800', marginBottom: 6 }}>Ingrédients</Body>
              {drink.ingredients.map((ing, i) => (
                <Row
                  key={`${ing.item}${i}`}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: i === drink.ingredients.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Body style={{ flex: 1 }}>{ing.item}</Body>
                  <Muted style={{ fontWeight: '700' }}>{ing.qty}</Muted>
                </Row>
              ))}
            </View>
          ) : null}

          {drink.steps.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Body style={{ fontWeight: '800', marginBottom: 8 }}>Préparation</Body>
              {drink.steps.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {drink.buy ? (
            <Panel tone="accent" style={{ marginTop: 8 }}>
              <Row style={{ marginBottom: 4 }}>
                <Icon name="shopping-basket" size={13} color={colors.accent} style={{ marginRight: 8 }} />
                <Body style={{ fontWeight: '800' }}>Si vous achetez</Body>
              </Row>
              <Body>{drink.buy}</Body>
            </Panel>
          ) : null}

          {drink.tip ? <Notice tone="info" style={{ marginTop: 12, marginBottom: 0 }}>{drink.tip}</Notice> : null}
        </Section>
      ) : null}

      {/* Liste de courses */}
      {shopping.length > 0 ? (
        <Section title="Liste de courses" icon="shopping-basket">
          {shopping.map((s, i) => (
            <Row
              key={s.item}
              style={{
                paddingVertical: 8,
                borderBottomWidth: i === shopping.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Icon name="check" size={11} color={colors.primary} style={{ width: 22 }} />
              <Body style={{ flex: 1 }}>{s.item}</Body>
              <Muted style={{ fontWeight: '700' }}>{s.qty.join(' + ')}</Muted>
            </Row>
          ))}
        </Section>
      ) : null}

      <Notice tone="info" style={{ marginBottom: 0 }}>
        Aucune boisson ne brûle la graisse à elle seule : elle aide, avec vos séances, le sommeil et une alimentation équilibrée. Pas d’avis médical : en cas de maladie ou de traitement, demandez conseil à un médecin.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroIcon: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  drinkIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  drinkName: { fontSize: 19, fontWeight: '800', color: colors.text },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1,
  },
  stepNumText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
});