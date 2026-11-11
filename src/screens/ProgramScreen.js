import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import {
  Body, Button, Chip, Icon, Muted, Notice, Pill, ProgressBar, Row, Screen, Section,
} from '../components/UI';
import ExerciseGuide from '../components/ExerciseGuide';
import { useApp } from '../context/AppContext';
import { EXERCISES, LEVEL_NAMES, computeLevel, getDayPlan } from '../data/program';
import { generatePlan } from '../services/ai';
import { JOURS, addDays, daysBetween, formatShort, mondayOf, weekdayOf } from '../utils/dates';

const DURATIONS = [1, 2, 3, 4, 7];

export default function ProgramScreen({ today, nav }) {
  const { state, setAiPlan } = useApp();
  const { profile, sessions, settings, weighIns, aiPlan, aiKey } = state;

  const [open, setOpen] = useState(null);
  const [guide, setGuide] = useState(null); // { id, reps, sets }
  const [weeksChoice, setWeeksChoice] = useState(1);
  const [weekOffset, setWeekOffset] = useState(0);
  const [gen, setGen] = useState({ running: false, done: 0, total: 0, error: '' });
  const abortRef = useRef(null);

  const { level, reason, weeks } = useMemo(
    () => computeLevel(sessions, profile.startDate, today),
    [sessions, profile.startDate, today]
  );

  const monday = addDays(mondayOf(today), weekOffset * 7);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => getDayPlan(addDays(monday, i), level, settings.times.workout, aiPlan)),
    [monday, level, settings.times.workout, aiPlan]
  );

  const maxOffset = aiPlan ? Math.max(1, Math.floor(daysBetween(mondayOf(today), aiPlan.endDate) / 7) + 1) : 1;
  const planEnded = aiPlan && today > aiPlan.endDate;

  const generate = async () => {
    if (!aiKey) {
      setGen({ running: false, done: 0, total: 0, error: 'Ajoutez d’abord votre clé Anthropic dans Réglages.' });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setGen({ running: true, done: 0, total: weeksChoice, error: '' });
    try {
      const plan = await generatePlan({
        apiKey: aiKey, profile, sessions, weighIns, level,
        startDate: today, weeks: weeksChoice, signal: controller.signal,
        onProgress: (done, total) => setGen((g) => ({ ...g, done, total })),
      });
      setAiPlan(plan);
      setWeekOffset(0);
      setGen({ running: false, done: 0, total: 0, error: '' });
    } catch (e) {
      setGen({
        running: false, done: 0, total: 0,
        error: e && e.name === 'AbortError' ? '' : (e && e.message) || 'Erreur inconnue.',
      });
    }
  };

  const cancel = () => abortRef.current && abortRef.current.abort();

  const hero = (
    <View>
      <Row style={{ flexWrap: 'wrap' }}>
        <Pill light icon="chart-line" label={`Niveau ${level + 1} · ${LEVEL_NAMES[level]}`} />
      </Row>
      <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 19, marginTop: 10 }}>
        {reason ||
          'Le niveau s’ajuste selon vos retours : deux séances « trop dures » allègent le programme, deux « faciles » l’augmentent.'}
      </Text>
    </View>
  );

  return (
    <>
      <Screen title="Programme" subtitle={`Semaine ${weeks + 1} depuis le début`} hero={hero}>
        {/* Générateur IA */}
        <Section title="Programme IA" icon="robot" iconColor={colors.accent}>
          {aiPlan ? (
            <Muted style={{ marginBottom: 8 }}>
              {planEnded ? 'Terminé' : 'En cours'} : du {formatShort(aiPlan.startDate)} au {formatShort(aiPlan.endDate)} ({aiPlan.weeks} semaine{aiPlan.weeks > 1 ? 's' : ''}).
              {aiPlan.summaries && aiPlan.summaries[0] ? `\n${aiPlan.summaries[0]}` : ''}
            </Muted>
          ) : (
            <Muted style={{ marginBottom: 8 }}>
              L’IA crée des séances différentes pour chaque jour, avec le nombre de répétitions et de séries, selon votre profil, votre poids et vos retours.
            </Muted>
          )}
          {planEnded ? <Notice tone="warn">Votre programme est terminé : générez-en un nouveau.</Notice> : null}

          <Muted style={{ marginBottom: 6 }}>Durée du programme :</Muted>
          <Row style={{ flexWrap: 'wrap' }}>
            {DURATIONS.map((n) => (
              <Chip
                key={n}
                label={n === 1 ? '1 semaine' : `${n} semaines`}
                selected={weeksChoice === n}
                onPress={() => !gen.running && setWeeksChoice(n)}
              />
            ))}
          </Row>

          {!aiKey ? (
            <Notice tone="warn">Clé Anthropic manquante. Ajoutez-la dans Réglages pour activer l’IA.</Notice>
          ) : null}
          {gen.error ? <Notice tone="danger">{gen.error}</Notice> : null}

          {gen.running ? (
            <>
              <Body style={{ marginBottom: 8 }}>
                Création de la semaine {Math.min(gen.done + 1, gen.total)} sur {gen.total}…
              </Body>
              <ProgressBar value={gen.total ? gen.done / gen.total : 0} color={colors.accent} />
              <Button title="Annuler" variant="ghost" small onPress={cancel} style={{ marginTop: 10 }} />
            </>
          ) : (
            <>
              <Button
                title={aiPlan ? 'Générer un nouveau programme' : 'Générer avec l’IA'}
                icon="magic"
                variant="accent"
                onPress={aiKey ? generate : () => nav.setTab('settings')}
              />
              {aiPlan ? (
                <Button
                  title="Revenir au programme standard"
                  variant="ghost"
                  small
                  icon="undo"
                  onPress={() => setAiPlan(null)}
                  style={{ marginTop: 8 }}
                />
              ) : null}
            </>
          )}
        </Section>

        {/* Semaine */}
        <Section title="Ma semaine" icon="calendar-alt">
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <Button icon="chevron-left" variant="secondary" small disabled={weekOffset <= -1} onPress={() => setWeekOffset(weekOffset - 1)} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Semaine du {formatShort(monday)}</Text>
              <Muted>{weekOffset === 0 ? 'Cette semaine' : weekOffset > 0 ? `Dans ${weekOffset} sem.` : 'Semaine passée'}</Muted>
            </View>
            <Button icon="chevron-right" variant="secondary" small disabled={weekOffset >= maxOffset} onPress={() => setWeekOffset(weekOffset + 1)} />
          </Row>

          {days.map((p, idx) => {
            const isToday = p.date === today;
            const isOpen = open === p.date;
            const session = sessions[p.date];
            const firstWork = p.steps.find((s) => s.kind === 'work');
            return (
              <View
                key={p.date}
                style={[
                  styles.dayRow,
                  idx === days.length - 1 && { borderBottomWidth: 0 },
                  isToday && styles.dayToday,
                ]}
              >
                <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(isOpen ? null : p.date)}>
                  <Row>
                    <View style={styles.dayIcon}>
                      <Icon name={p.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Muted>
                        {JOURS[weekdayOf(p.date)].toUpperCase()}
                        {isToday ? ' · AUJOURD’HUI' : ''}
                      </Muted>
                      <Body style={{ fontWeight: '700' }}>{p.title}</Body>
                      <Muted>
                        {p.time} · {p.durationMin} min{p.ai ? ' · IA' : ''}
                      </Muted>
                    </View>
                    {session && session.status === 'done' ? (
                      <Icon name="check-circle" size={20} color={colors.good} />
                    ) : session && session.status === 'skipped' ? (
                      <Icon name="times-circle" size={20} color={colors.accent} />
                    ) : (
                      <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
                    )}
                  </Row>
                </TouchableOpacity>

                {isOpen && (
                  <View style={{ marginTop: 12 }}>
                    {p.desc ? <Muted style={{ marginBottom: 8 }}>{p.desc}</Muted> : null}
                    {p.exItems.length > 0 ? (
                      <>
                        <Body style={{ fontWeight: '700', marginBottom: 6 }}>Exercices (touchez pour le guide)</Body>
                        {p.exItems.map(({ id, reps }, i) => (
                          <TouchableOpacity
                            key={`${id}${i}`}
                            onPress={() => setGuide({ id, reps, sets: p.sets })}
                            activeOpacity={0.7}
                          >
                            <Row style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: isToday ? '#FFFFFF' : colors.border }}>
                              <Icon name={EXERCISES[id].icon} size={14} color={colors.accent} style={{ width: 26 }} />
                              <Body style={{ flex: 1 }}>{EXERCISES[id].name}</Body>
                              {reps ? (
                                <Text style={{ color: colors.primaryDark, fontWeight: '800', marginRight: 10 }}>
                                  {reps} rép.
                                </Text>
                              ) : null}
                              <Icon name="question-circle" size={14} color={colors.muted} />
                            </Row>
                          </TouchableOpacity>
                        ))}
                        {firstWork ? (
                          <Muted style={{ marginTop: 8 }}>
                            {p.sets ? `${p.sets} séries · ` : ''}{firstWork.seconds} s d’effort · échauffement 3 min · étirements 3 min.
                          </Muted>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Body style={{ fontWeight: '700', marginBottom: 4 }}>Étapes</Body>
                        {p.steps.map((s, i) => (
                          <Body key={`${s.name}${i}`}>
                            • {s.name} : {Math.round(s.seconds / 60)} min
                          </Body>
                        ))}
                      </>
                    )}
                    {isToday && !session ? (
                      <Button title="Commencer" icon="play" onPress={() => nav.startWorkout(p)} style={{ marginTop: 12 }} />
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}
        </Section>
      </Screen>

      <ExerciseGuide
        id={guide ? guide.id : null}
        reps={guide ? guide.reps : null}
        sets={guide ? guide.sets : null}
        onClose={() => setGuide(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  dayRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  dayToday: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderBottomWidth: 0,
  },
  dayIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
});