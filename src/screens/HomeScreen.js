import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import {
  Body, Button, Card, Chip, GradientCard, Heading, Icon, Muted, Notice, ProgressBar, Row, Screen, Title,
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
  const { profile, weighIns, sessions, settings, aiPlan } = state;

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

  // Bandeau programme IA
  const planEnded = aiPlan && today > aiPlan.endDate;
  let aiBanner = null;
  if (!aiPlan) {
    aiBanner = (
      <Card tone="accent">
        <Heading icon="robot" iconColor={colors.accent}>Programme personnalisé IA</Heading>
        <Muted style={{ marginBottom: 10 }}>
          Générez des séances différentes chaque jour, sur 1 à 7 semaines, adaptées à vos retours.
        </Muted>
        <Button title="Générer mon programme" icon="magic" variant="accent" small onPress={() => nav.setTab('program')} />
      </Card>
    );
  } else if (planEnded) {
    aiBanner = (
      <Card tone="accent">
        <Heading icon="sync-alt" iconColor={colors.accent}>Votre programme IA est terminé</Heading>
        <Muted style={{ marginBottom: 10 }}>Bravo ! Générez un nouveau programme adapté à vos progrès.</Muted>
        <Button title="Générer un nouveau programme" icon="magic" variant="accent" small onPress={() => nav.setTab('program')} />
      </Card>
    );
  }
  const planWeek = aiPlan && !planEnded ? Math.floor(daysBetween(aiPlan.startDate, today) / 7) + 1 : null;

  return (
    <Screen>
      <View style={{ marginBottom: 14 }}>
        <Muted>{formatLong(today)}</Muted>
        <Title>{greeting}</Title>
      </View>

      {!profile.sex && (
        <Card tone="accent">
          <Heading>Une précision</Heading>
          <Muted style={{ marginBottom: 8 }}>Vous êtes ? Cela sert aux repères du tour de taille.</Muted>
          <Row>
            {Object.entries(SEXES).map(([key, label]) => (
              <Chip key={key} label={label} onPress={() => saveProfile({ sex: key })} />
            ))}
          </Row>
        </Card>
      )}

      {aiBanner}

      {/* Séance du jour */}
      <GradientCard>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>
            SÉANCE DU JOUR
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' }}>
            {planWeek ? `Sem. ${planWeek}/${aiPlan.weeks} · ` : ''}Niveau {level + 1} · {LEVEL_NAMES[level]}
          </Text>
        </Row>

        <Row style={{ marginTop: 14 }}>
          <Float>
            <View
              style={{
                width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}
            >
              <Icon name={plan.icon} size={28} color="#FFFFFF" />
            </View>
          </Float>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{plan.title}</Text>
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
      </GradientCard>

      {/* Suivi de la séance */}
      <Card>
        <Heading icon="clipboard-check">Suivi de la séance</Heading>
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
      </Card>

      {/* Semaine */}
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <Heading style={{ marginBottom: 0 }}>Cette semaine</Heading>
          <Muted>{doneThisWeek} séance(s) faite(s)</Muted>
        </Row>
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
      </Card>

      {/* Poids */}
      <Card>
        <Heading icon="balance-scale">Mon poids</Heading>
        {stats && (
          <>
            <Row style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 40, fontWeight: '800', color: colors.text }}>{fmtKg(stats.last.weight)}</Text>
              <Text style={{ fontSize: 18, color: colors.muted, marginLeft: 6, marginBottom: 6 }}>kg</Text>
              {stats.deltaPrev !== null && (
                <Text
                  style={{
                    marginLeft: 12, marginBottom: 8, fontWeight: '700',
                    color: stats.deltaPrev <= 0 ? colors.good : colors.accent,
                  }}
                >
                  {fmtKg(stats.deltaPrev, true)} kg
                </Text>
              )}
            </Row>
            <ProgressBar value={stats.progress} style={{ marginVertical: 10 }} />
            <Muted>
              Objectif {fmtKg(profile.goalWeight)} kg · reste {fmtKg(stats.remaining)} kg · {Math.round(stats.progress * 100)} %
            </Muted>
          </>
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
      </Card>

      {/* Sommeil */}
      <Card tone="primary">
        <Heading icon="moon">Sommeil</Heading>
        <Body>
          Coucher visé : {settings.times.bedtime} · réveil {settings.times.wake} → {formatDuration(sleepMin)} de sommeil.
        </Body>
        <Muted style={{ marginTop: 4 }}>
          Un rappel arrive 30 minutes avant. Le sommeil aide autant que le sport pour le ventre.
        </Muted>
      </Card>

      {/* Conseil */}
      <Card tone="accent">
        <Heading icon="lightbulb" iconColor={colors.accent}>Conseil du jour</Heading>
        <Body>{tip}</Body>
      </Card>

      <Muted style={{ textAlign: 'center', marginTop: 4 }}>
        Programme commencé le {formatShort(profile.startDate)}. Mizana donne des repères généraux, pas un avis médical.
      </Muted>
    </Screen>
  );
}