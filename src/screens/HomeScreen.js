import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import {
  Body, Button, Chip, Heading, Icon, Muted, Notice, Panel, Pill, ProgressBar, Row, Screen, Section, StatRow,
} from '../components/UI';
import { Float } from '../components/Motion';
import { useApp } from '../context/AppContext';
import { FEELINGS, LEVEL_NAMES, TIPS, computeLevel, getDayPlan } from '../data/program';
import { SEXES, computeStats, fmtKg } from '../utils/calc';
import {
  JOURS_COURTS, addDays, dayOfYear, daysBetween, formatDuration, formatLong, formatShort,
  mondayOf, nextSunday, sleepMinutes, weekdayOf,
} from '../utils/dates';

export default function HomeScreen({ today, nav }) {
  const { state, setSession, saveProfile } = useApp();
  const { profile, weighIns, sessions, settings, aiPlan, aiDrinks } = state;

  const { level, reason } = useMemo(
    () => computeLevel(sessions, profile.startDate, today),
    [sessions, profile.startDate, today]
  );
  const plan = useMemo(
    () => getDayPlan(today, level, settings.times.workout, aiPlan),
    [today, level, settings.times.workout, aiPlan]
  );
  const stats = useMemo(() => computeStats(profile, weighIns), [profile, weighIns]);
  const session = sessions[today];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Salama, bonne matinée' : hour < 18 ? 'Salama, bon après-midi' : 'Salama, bonne soirée';

  const monday = mondayOf(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return { date, label: JOURS_COURTS[weekdayOf(date)], session: sessions[date] };
  });
  const doneThisWeek = week.filter((d) => d.session && d.session.status === 'done').length;

  const sunday = addDays(monday, 6);
  const weighedThisWeek = weighIns.some((w) => w.date >= monday && w.date <= sunday);
  const isSunday = weekdayOf(today) === 0;

  const tip = TIPS[dayOfYear(today) % TIPS.length];
  const sleepMin = sleepMinutes(settings.times.bedtime, settings.times.wake);
  const markDone = (feeling) => setSession(today, { status: 'done', feeling });

  const drink = aiDrinks && aiDrinks.drinks ? aiDrinks.drinks[today] : null;

  // Bandeau programme IA
  const planEnded = aiPlan && today > aiPlan.endDate;
  let aiBanner = null;
  if (!aiPlan) {
    aiBanner = (
      <Panel tone="accent">
        <Heading icon="robot" iconColor={colors.accent}>Programme personnalisé IA</Heading>
        <Muted style={{ marginBottom: 10 }}>
          Générez des séances différentes chaque jour, sur 1 à 7 semaines, adaptées à vos retours.
        </Muted>
        <Button title="Générer mon programme" icon="magic" variant="accent" small onPress={() => nav.setTab('program')} />
      </Panel>
    );
  } else if (planEnded) {
    aiBanner = (
      <Panel tone="accent">
        <Heading icon="sync-alt" iconColor={colors.accent}>Votre programme IA est terminé</Heading>
        <Muted style={{ marginBottom: 10 }}>Bravo ! Générez un nouveau programme adapté à vos progrès.</Muted>
        <Button title="Générer un nouveau programme" icon="magic" variant="accent" small onPress={() => nav.setTab('program')} />
      </Panel>
    );
  }
  const planWeek = aiPlan && !planEnded ? Math.floor(daysBetween(aiPlan.startDate, today) / 7) + 1 : null;

  // Séance du jour : dans l'en-tête bleu
  const hero = (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 22, padding: 16 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>
          SÉANCE DU JOUR
        </Text>
        <Pill light label={`${planWeek ? `Sem. ${planWeek}/${aiPlan.weeks} · ` : ''}Niveau ${level + 1} · ${LEVEL_NAMES[level]}`} />
      </Row>

      <Row style={{ marginTop: 14 }}>
        <Float>
          <View
            style={{
              width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}
          >
            <Icon name={plan.icon} size={26} color="#FFFFFF" />
          </View>
        </Float>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 21, fontWeight: '800' }}>{plan.title}</Text>
          <Row style={{ marginTop: 4 }}>
            <Icon name="stopwatch" size={12} color="rgba(255,255,255,0.85)" style={{ marginRight: 6 }} />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
              {plan.time} · {plan.durationMin} min
            </Text>
            {plan.ai ? (
              <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>IA</Text>
              </View>
            ) : null}
          </Row>
        </View>
      </Row>

      {plan.desc ? (
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginTop: 12 }}>{plan.desc}</Text>
      ) : null}
      {plan.exercises.length > 0 && (
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 10 }}>
          {plan.exercises.join(' · ')}
        </Text>
      )}

      <View style={{ marginTop: 16 }}>
        {session && session.status === 'done' ? (
          <Row>
            <Icon name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Séance faite, bravo !</Text>
          </Row>
        ) : (
          <Button title="Commencer la séance" icon="play" variant="light" onPress={() => nav.startWorkout(plan)} />
        )}
      </View>
    </View>
  );

  return (
    <Screen title={greeting} subtitle={formatLong(today)} hero={hero}>
      {!profile.sex && (
        <Panel tone="accent">
          <Heading>Une précision</Heading>
          <Muted style={{ marginBottom: 8 }}>Vous êtes ? Cela sert aux repères du tour de taille.</Muted>
          <Row>
            {Object.entries(SEXES).map(([key, label]) => (
              <Chip key={key} label={label} onPress={() => saveProfile({ sex: key })} />
            ))}
          </Row>
        </Panel>
      )}

      {aiBanner}

      {/* Mon poids */}
      <Section title="Mon poids" icon="balance-scale">
        {stats ? (
          <>
            <StatRow
              items={[
                {
                  label: 'Actuel',
                  value: `${fmtKg(stats.last.weight)} kg`,
                  sub: stats.deltaPrev !== null ? `${fmtKg(stats.deltaPrev, true)} kg` : null,
                  tone: stats.deltaPrev === null ? undefined : stats.deltaPrev <= 0 ? 'good' : 'warn',
                },
                { label: 'Reste', value: `${fmtKg(stats.remaining)} kg`, sub: `Objectif ${fmtKg(profile.goalWeight)}` },
                { label: 'Séances', value: String(doneThisWeek), sub: 'cette semaine' },
              ]}
            />
            <ProgressBar value={stats.progress} style={{ marginTop: 14, marginBottom: 8 }} />
            <Muted>{Math.round(stats.progress * 100)} % de l’objectif atteint</Muted>
          </>
        ) : (
          <Muted>Aucune pesée enregistrée pour le moment.</Muted>
        )}
        {isSunday && !weighedThisWeek ? (
          <>
            <Notice tone="info" style={{ marginTop: 12 }}>
              C’est dimanche : jour de pesée. Pesez-vous à jeun, avant le petit-déjeuner.
            </Notice>
            <Button title="Peser maintenant" icon="balance-scale" onPress={() => nav.setTab('weigh')} />
          </>
        ) : (
          <Muted style={{ marginTop: 10 }}>
            Prochaine pesée : {formatLong(nextSunday(isSunday ? addDays(today, 1) : today))}
          </Muted>
        )}
      </Section>

      {/* Suivi de la séance */}
      <Section title="Suivi de la séance" icon="clipboard-check">
        {reason ? <Notice tone="info">{reason}</Notice> : null}

        {!session && (
          <>
            <Muted style={{ marginBottom: 6 }}>Déjà faite ? Notez-la :</Muted>
            <Row style={{ flexWrap: 'wrap' }}>
              {Object.entries(FEELINGS).map(([key, label]) => (
                <Chip key={key} label={label} icon="check" onPress={() => markDone(key)} />
              ))}
            </Row>
            <Button
              title="Pas fait aujourd’hui"
              variant="ghost"
              small
              icon="times"
              onPress={() => setSession(today, { status: 'skipped' })}
            />
          </>
        )}

        {session && session.status === 'done' && (
          <>
            <Muted style={{ marginBottom: 6 }}>Ressenti (modifiable) :</Muted>
            <Row style={{ flexWrap: 'wrap' }}>
              {Object.entries(FEELINGS).map(([key, label]) => (
                <Chip key={key} label={label} selected={session.feeling === key} onPress={() => markDone(key)} />
              ))}
            </Row>
            <Button title="Annuler" variant="ghost" small onPress={() => setSession(today, null)} />
          </>
        )}

        {session && session.status === 'skipped' && (
          <>
            <Notice tone="warn">Séance non faite aujourd’hui. Pas grave : on repart à la prochaine.</Notice>
            <Button title="Finalement, je la fais" icon="play" onPress={() => nav.startWorkout(plan)} />
            <Button title="Annuler" variant="ghost" small onPress={() => setSession(today, null)} style={{ marginTop: 8 }} />
          </>
        )}
      </Section>

      {/* Semaine */}
      <Section
        title="Cette semaine"
        icon="calendar-check"
        right={<Muted>{doneThisWeek} séance(s) faite(s)</Muted>}
      >
        <Row style={{ justifyContent: 'space-between' }}>
          {week.map((d) => {
            const isToday = d.date === today;
            const status = d.session && d.session.status;
            const bg = status === 'done' ? colors.primary : status === 'skipped' ? colors.accentSoft : colors.bg;
            const fg = status === 'done' ? '#FFFFFF' : status === 'skipped' ? colors.accent : colors.muted;
            return (
              <View key={d.date} style={{ alignItems: 'center', flex: 1 }}>
                <Muted style={{ marginBottom: 4, fontWeight: isToday ? '800' : '400' }}>{d.label}</Muted>
                <View
                  style={{
                    width: 34, height: 34, borderRadius: 17, backgroundColor: bg,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: isToday ? 2 : 0, borderColor: colors.accent,
                  }}
                >
                  {status === 'done' ? (
                    <Icon name="check" size={13} color={fg} />
                  ) : status === 'skipped' ? (
                    <Icon name="times" size={13} color={fg} />
                  ) : (
                    <Text style={{ color: fg, fontWeight: '800' }}>·</Text>
                  )}
                </View>
              </View>
            );
          })}
        </Row>
      </Section>

      {/* Boisson du jour */}
      <Section title="Boisson du jour" icon="blender" iconColor={colors.accent}>
        {drink ? (
          <>
            <Body style={{ fontWeight: '800', fontSize: 17 }}>{drink.name}</Body>
            <Muted style={{ marginTop: 2 }}>
              {drink.when}{drink.minutes ? ` · ${drink.minutes} min de préparation` : ''}
            </Muted>
            {drink.goal ? <Body style={{ marginTop: 8 }}>{drink.goal}</Body> : null}
            <Button
              title="Voir la recette"
              icon="book-open"
              variant="secondary"
              small
              onPress={() => nav.setTab('drinks')}
              style={{ marginTop: 12 }}
            />
          </>
        ) : (
          <>
            <Muted style={{ marginBottom: 10 }}>
              Une boisson 100 % naturelle pour accompagner vos séances : à préparer en mixant ou à acheter.
            </Muted>
            <Button title="Générer ma boisson" icon="magic" variant="accent" small onPress={() => nav.setTab('drinks')} />
          </>
        )}
      </Section>

      {/* Sommeil */}
      <Section title="Sommeil" icon="moon">
        <Body>
          Coucher visé : {settings.times.bedtime} · réveil {settings.times.wake} → {formatDuration(sleepMin)} de sommeil.
        </Body>
        <Muted style={{ marginTop: 4 }}>
          Un rappel arrive 30 minutes avant. Le sommeil aide autant que le sport pour le ventre.
        </Muted>
      </Section>

      {/* Conseil */}
      <Section title="Conseil du jour" icon="lightbulb" iconColor={colors.accent}>
        <Body>{tip}</Body>
      </Section>

      <Muted style={{ textAlign: 'center' }}>
        Programme commencé le {formatShort(profile.startDate)}. Mizana donne des repères généraux, pas un avis médical.
      </Muted>
    </Screen>
  );
}