// Séance guidée : visuel animé, minuteur, voix, guide de l'exercice.
import React, { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { colors } from '../theme';
import { FEELINGS } from '../data/program';
import { formatMMSS } from '../utils/dates';
import { Chip, Icon } from '../components/UI';
import { FadeIn, Float, Pulse } from '../components/Motion';
import ExerciseVisual from '../components/ExerciseVisual';
import ExerciseGuide from '../components/ExerciseGuide';

const KIND_STYLE = {
  warmup: { label: 'ÉCHAUFFEMENT', grad: ['#3B82F6', '#1E4FD8'], color: '#1E4FD8', icon: 'fire' },
  work: { label: 'EFFORT', grad: ['#F2455A', '#B80F28'], color: '#C4122B', icon: 'dumbbell' },
  rest: { label: 'REPOS', grad: ['#2F6BFF', '#0F2F8F'], color: '#0F2F8F', icon: 'tint' },
  cool: { label: 'RETOUR AU CALME', grad: ['#16358F', '#081945'], color: '#081945', icon: 'spa' },
};

export default function WorkoutScreen({ plan, onClose, onComplete }) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const steps = plan.steps;
  const totalSeconds = steps.reduce((s, st) => s + st.seconds, 0);

  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(steps[0].seconds);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [voice, setVoice] = useState(true);
  const [guide, setGuide] = useState(null); // { id, reps, sets }
  const remRef = useRef(steps[0].seconds);

  const confirmQuit = () => {
    Alert.alert('Quitter la séance ?', 'Votre progression de cette séance sera perdue.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: onClose },
    ]);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (finished) return false;
      confirmQuit();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Annonce vocale de chaque étape
  useEffect(() => {
    if (!voice || finished) return;
    const s = steps[idx];
    let text = s.name;
    if (s.kind === 'rest') text = `Repos.${s.next ? ` Ensuite : ${s.next}` : ''}`;
    else if (s.kind === 'work' && s.reps) text = `${s.name}. ${s.reps} répétitions.`;
    try {
      Speech.stop();
      Speech.speak(text, { language: 'fr-FR' });
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voice, finished]);

  useEffect(() => () => { try { Speech.stop(); } catch (e) { /* ignore */ } }, []);

  const advance = () => {
    if (idx + 1 < steps.length) {
      const next = steps[idx + 1];
      remRef.current = next.seconds;
      setRemaining(next.seconds);
      setIdx(idx + 1);
      Vibration.vibrate(next.kind === 'work' ? 350 : [0, 150, 100, 150]);
    } else {
      setFinished(true);
      Vibration.vibrate([0, 400, 150, 400, 150, 400]);
    }
  };

  // Minuteur basé sur l'heure réelle
  useEffect(() => {
    if (paused || finished) return undefined;
    const end = Date.now() + remRef.current * 1000;
    const id = setInterval(() => {
      const left = Math.ceil((end - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(id);
        advance();
      } else if (left !== remRef.current) {
        remRef.current = left;
        setRemaining(left);
        if (left <= 3) Vibration.vibrate(60);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paused, finished]);

  if (finished) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.navy]}
        style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, justifyContent: 'center' }]}
      >
        <StatusBar barStyle="light-content" />
        <FadeIn>
          <View style={{ alignItems: 'center' }}>
            <Pulse scale={1.12}>
              <View style={styles.trophy}>
                <Icon name="trophy" size={46} color="#FFFFFF" />
              </View>
            </Pulse>
            <Text style={styles.finishTitle}>Séance terminée !</Text>
            <Text style={styles.finishSub}>
              {plan.title} · {plan.durationMin} min. Comment c’était ?
            </Text>
            <View style={styles.feelRow}>
              {Object.entries(FEELINGS).map(([key, label]) => (
                <Chip key={key} label={label} onPress={() => onComplete(key)} />
              ))}
            </View>
            <TouchableOpacity onPress={() => onComplete(null)} style={{ marginTop: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Terminer sans noter</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>
      </LinearGradient>
    );
  }

  const step = steps[idx];
  const style = KIND_STYLE[step.kind] || KIND_STYLE.work;
  const elapsedBefore = steps.slice(0, idx).reduce((s, st) => s + st.seconds, 0);
  const overall = (elapsedBefore + (step.seconds - remaining)) / totalSeconds;
  const guideTarget = step.exId || step.previewId || null;
  const guideReps = step.reps || step.previewReps || null;
  const guideSets = step.exId || step.previewId ? step.rounds || null : null;

  let counter = '';
  if (step.kind === 'work' && step.rounds > 1) {
    counter = `Série ${step.round}/${step.rounds} · Exercice ${step.index}/${step.count}`;
  } else if (step.kind === 'rest' && step.rounds) {
    counter = `Série ${step.round}/${step.rounds}`;
  }

  return (
    <LinearGradient colors={style.grad} style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topRow}>
        <Text style={[styles.topText, { flex: 1 }]} numberOfLines={1}>{plan.title}</Text>
        <TouchableOpacity onPress={() => setVoice((v) => !v)} style={styles.topBtn}>
          <Icon name={voice ? 'volume-up' : 'volume-mute'} size={15} color="#FFFFFF" />
        </TouchableOpacity>
        {guideTarget ? (
          <TouchableOpacity
            onPress={() => {
              setPaused(true);
              setGuide({ id: guideTarget, reps: guideReps, sets: guideSets });
            }}
            style={styles.topBtn}
          >
            <Icon name="question-circle" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={confirmQuit} style={styles.topBtn}>
          <Icon name="times" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, overall * 100)}%` }]} />
      </View>

      <FadeIn key={idx} style={styles.center} distance={24} duration={350}>
        <Text style={styles.kind}>{style.label}</Text>

        {step.exId ? (
          <ExerciseVisual id={step.exId} size={150} tone="light" />
        ) : step.kind === 'rest' && step.previewId ? (
          <View style={{ alignItems: 'center' }}>
            <ExerciseVisual id={step.previewId} size={96} tone="light" />
            <Text style={styles.preview}>
              À suivre : {step.next}{step.previewReps ? ` · ${step.previewReps} rép.` : ''}
            </Text>
          </View>
        ) : (
          <Float>
            <View style={styles.bigIcon}>
              <Icon name={step.icon || style.icon} size={54} color="#FFFFFF" />
            </View>
          </Float>
        )}

        <Text style={styles.name}>{step.name}</Text>

        {step.kind === 'work' && step.reps ? (
          <View style={styles.repsBox}>
            <Icon name="bullseye" size={13} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.repsText}>Objectif : {step.reps} répétitions</Text>
          </View>
        ) : null}

        <Text style={styles.timer}>{formatMMSS(remaining)}</Text>
        {counter ? <Text style={styles.counter}>{counter}</Text> : null}
        <Text style={styles.hint}>{step.hint}</Text>
        {step.tip ? (
          <View style={styles.tipBox}>
            <Icon name="lightbulb" size={13} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.tipText}>{step.tip}</Text>
          </View>
        ) : null}
      </FadeIn>

      {step.next ? <Text style={styles.next}>Ensuite : {step.next}</Text> : <Text style={styles.next}>Dernière étape</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.btnMain]} onPress={() => setPaused((p) => !p)}>
          <Icon name={paused ? 'play' : 'pause'} size={15} color={style.color} style={{ marginRight: 8 }} />
          <Text style={[styles.btnText, { color: style.color }]}>{paused ? 'Reprendre' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={advance}>
          <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Passer</Text>
          <Icon name="forward" size={15} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      <ExerciseGuide
        id={guide ? guide.id : null}
        reps={guide ? guide.reps : null}
        sets={guide ? guide.sets : null}
        onClose={() => setGuide(null)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  topText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' },
  topBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kind: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  bigIcon: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  preview: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', marginTop: 4 },
  name: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  repsBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8,
  },
  repsText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  timer: { color: '#FFFFFF', fontSize: 84, fontWeight: '800', marginVertical: 2, fontVariant: ['tabular-nums'] },
  counter: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  hint: { color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },
  tipBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, marginHorizontal: 8,
  },
  tipText: { color: '#FFFFFF', fontSize: 13, flex: 1 },
  next: { color: 'rgba(255,255,255,0.85)', fontSize: 15, textAlign: 'center', marginBottom: 14 },
  buttons: { flexDirection: 'row' },
  btn: { flex: 1, flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnMain: { backgroundColor: '#FFFFFF', marginRight: 10 },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.22)' },
  btnText: { fontSize: 17, fontWeight: '800' },
  trophy: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  finishTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 20, color: '#FFFFFF' },
  finishSub: { fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 10, color: 'rgba(255,255,255,0.85)' },
  feelRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});