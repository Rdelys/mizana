// Programme de Mizana : une séance du soir à la maison (pompes + planche).
// Règles fixes (hors ligne) + programme généré par l'IA.
import { addDays, daysBetween, weekdayOf } from '../utils/dates';
import { EXERCISES } from './exercises';

export { EXERCISES };

export const FEELINGS = { facile: 'Facile', correct: 'Correct', dur: 'Trop dur' };

const BASE_TITLE = 'Pompes et planche';

const WARMUP = [
  { name: 'Rotations épaules et poignets', hint: 'Grands cercles avec les épaules, puis avec les poignets. Dans les deux sens.', seconds: 45, icon: 'sync-alt' },
  { name: 'Mobilité des bras', hint: 'Bras tendus, ouvrez et croisez devant vous, en rythme tranquille.', seconds: 45, icon: 'expand-arrows-alt' },
];

const COOLDOWN = [
  { name: 'Étirement de la poitrine', hint: 'Mains jointes derrière le dos, poitrine ouverte, tenez 20 secondes.', seconds: 45, icon: 'spa' },
  { name: 'Posture de l’enfant', hint: 'À genoux, fesses sur les talons, bras tendus devant vous. Respirez lentement.', seconds: 45, icon: 'spa' },
  { name: 'Respiration calme', hint: 'Inspirez 4 secondes, expirez 6 secondes. Laissez le rythme cardiaque redescendre.', seconds: 30, icon: 'heartbeat' },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Exercices tenus (planches) : pas de répétitions
const isHold = (id) => !!(EXERCISES[id] && EXERCISES[id].motion === 'hold');

// Répétitions : null pour un exercice tenu ou si absent
function repsOf(id, v) {
  if (isHold(id)) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? clamp(n, 3, 40) : null;
}

// Séance standard (sans IA), selon le niveau (0 à 3)
const LEVELS = [
  { push: 'pushupKnee', reps: 6, plank: 'plankKnee', hold: 20, side: null, rounds: 3 },
  { push: 'pushupKnee', reps: 10, plank: 'plank', hold: 25, side: null, rounds: 3 },
  { push: 'pushup', reps: 6, plank: 'plank', hold: 35, side: null, rounds: 3 },
  { push: 'pushup', reps: 10, plank: 'plank', hold: 45, side: 'sidePlank', rounds: 4 },
];

// Le dimanche (jour de pesée) la séance est un peu plus légère
function defaultSession(level, weekday) {
  const L = LEVELS[level];
  const light = weekday === 0;
  const reps = light ? Math.max(4, Math.round(L.reps * 0.7)) : L.reps;
  const rounds = light ? Math.max(2, L.rounds - 1) : L.rounds;
  const hold = light ? Math.round(L.hold * 0.8) : L.hold;

  const items = [
    { id: L.push, work: clamp(reps * 3 + 15, 25, 90), rest: 30, reps },
    { id: L.plank, work: hold, rest: 30, reps: null },
  ];
  if (L.side) items.push({ id: L.side, work: Math.max(15, Math.round(hold / 2)), rest: 30, reps: null });
  return { items, rounds, light };
}

// items : [{ id, work, rest, tip, reps }]
function buildStrengthSteps(items, rounds) {
  const roundRest = 45;
  const steps = [];
  WARMUP.forEach((w) => steps.push({ kind: 'warmup', ...w }));

  for (let r = 1; r <= rounds; r += 1) {
    items.forEach((it, i) => {
      const ex = EXERCISES[it.id];
      steps.push({
        kind: 'work', exId: it.id, name: ex.name, hint: ex.hint, tip: it.tip || null,
        reps: it.reps || null,
        seconds: it.work, round: r, rounds, index: i + 1, count: items.length,
      });
      const lastOfRound = i === items.length - 1;
      const veryLast = lastOfRound && r === rounds;
      if (!veryLast) {
        const nextItem = lastOfRound ? items[0] : items[i + 1];
        steps.push({
          kind: 'rest',
          name: lastOfRound ? 'Repos entre les séries' : 'Repos',
          hint: 'Respirez calmement, une gorgée d’eau si besoin.',
          seconds: lastOfRound ? roundRest : it.rest,
          round: r, rounds, previewId: nextItem.id, previewReps: nextItem.reps || null,
        });
      }
    });
  }
  COOLDOWN.forEach((c) => steps.push({ kind: 'cool', ...c }));
  return steps;
}

function attachNext(steps) {
  return steps.map((s, i) => ({ ...s, next: steps[i + 1] ? steps[i + 1].name : null }));
}

// Transforme un jour généré par l'IA en étapes (null si le jour n'est pas utilisable)
function specToSteps(spec) {
  if (!spec || spec.type !== 'strength') return null;
  const items = (spec.exercises || [])
    .filter((e) => e && EXERCISES[e.id])
    .map((e) => ({
      id: e.id,
      work: clamp(Math.round(e.work || 30), 15, 90),
      rest: clamp(Math.round(e.rest || 30), 10, 90),
      tip: e.tip || null,
      reps: repsOf(e.id, e.reps),
    }));
  if (items.length < 2) return null;
  return buildStrengthSteps(items, clamp(Math.round(spec.rounds || 3), 1, 5));
}

// Plan complet d'un jour. Si l'IA a un programme pour cette date, il est utilisé.
export function getDayPlan(dateISO, level, time, aiPlan) {
  const weekday = weekdayOf(dateISO);
  const spec = aiPlan && aiPlan.days ? aiPlan.days[dateISO] : null;
  let steps = spec ? specToSteps(spec) : null;
  let meta;
  let exIds;

  if (steps) {
    exIds = (spec.exercises || []).map((e) => e.id).filter((id) => EXERCISES[id]);
    meta = { icon: 'dumbbell', title: spec.title || BASE_TITLE, desc: spec.focus || '', ai: true };
  } else {
    const { items, rounds, light } = defaultSession(level, weekday);
    exIds = items.map((i) => i.id);
    steps = buildStrengthSteps(items, rounds);
    meta = {
      icon: 'dumbbell',
      title: BASE_TITLE,
      desc: light
        ? 'Soir plus léger : on garde le rythme sans fatiguer, c’est jour de pesée.'
        : 'Poitrine, bras et gainage du ventre, à la maison, sans matériel.',
      ai: false,
    };
  }

  steps = attachNext(steps);
  const totalSeconds = steps.reduce((sum, s) => sum + s.seconds, 0);

  // Exercices de la première série (répétitions ou durée) et nombre de séries
  const exItems = steps
    .filter((s) => s.kind === 'work' && s.exId && s.round === 1)
    .map((s) => ({ id: s.exId, reps: s.reps || null, seconds: s.seconds }));
  const firstWork = steps.find((s) => s.kind === 'work' && s.exId);

  return {
    date: dateISO,
    weekday,
    type: 'strength',
    ...meta,
    durationMin: Math.max(1, Math.round(totalSeconds / 60)),
    exIds,
    exItems,
    sets: firstWork ? firstWork.rounds : null,
    exercises: exIds.map((id) => EXERCISES[id].name),
    steps,
    level,
    time,
  };
}

// Niveau du jour (0 à 3), avec la raison d'un éventuel ajustement
export function computeLevel(sessions, startDate, today) {
  const weeks = Math.max(0, Math.floor(daysBetween(startDate, today) / 7));
  let level = Math.min(3, Math.floor(weeks / 2));
  let reason = null;

  const recent = Object.entries(sessions || {})
    .filter(([d, s]) => d <= today && s && s.status === 'done' && s.feeling)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 3)
    .map(([, s]) => s.feeling);

  const hard = recent.filter((f) => f === 'dur').length;
  const easy = recent.filter((f) => f === 'facile').length;

  if (hard >= 2) {
    level -= 1;
    reason = 'Vos dernières séances étaient trop dures : programme allégé.';
  } else if (easy >= 2 && hard === 0) {
    level += 1;
    reason = 'Vos dernières séances étaient faciles : intensité augmentée.';
  }

  // Séances manquées sur les 7 derniers jours (une séance chaque soir)
  let missed = 0;
  for (let i = 1; i <= 7; i += 1) {
    const d = addDays(today, -i);
    if (d < startDate) continue;
    const s = sessions && sessions[d];
    if (!s || s.status !== 'done') missed += 1;
  }
  if (missed >= 4 && !reason) {
    level -= 1;
    reason = 'Plusieurs soirs manqués cette semaine : on reprend en douceur.';
  }

  return { level: clamp(level, 0, 3), reason, weeks };
}

export const LEVEL_NAMES = ['Démarrage', 'Progression', 'Intermédiaire', 'Confirmé'];

export const TIPS = [
  'Un verre d’eau avant chaque repas aide à manger un peu moins sans y penser.',
  'Dîner léger et au moins 2 h 30 avant le coucher : le sommeil et le ventre vous remercieront.',
  'Dormir 7 h 30 réduit la faim du lendemain. Le coucher à l’heure est un vrai « exercice ».',
  'Boissons sucrées et jus industriels : ce sont souvent les calories les plus faciles à supprimer.',
  'Dans l’assiette : un quart de riz, un quart de protéines, la moitié de légumes.',
  'Mangez lentement : le cerveau met environ 20 minutes à comprendre qu’on est rassasié.',
  'Protéines à chaque repas (œufs, poisson, poulet, haricots secs) : elles protègent vos muscles.',
  'Une fringale à 16 h ? Un grand verre d’eau ou un thé sans sucre, puis attendez 10 minutes.',
  'Le poids varie d’un jour à l’autre. Ce qui compte, c’est la courbe sur plusieurs semaines.',
  'Se lever toutes les heures quand on est assis au travail, même 1 minute, fait une vraie différence.',
  'Posez le téléphone 30 minutes avant de dormir : l’endormissement sera plus rapide.',
  'Mesurez le tour de taille au niveau du nombril : il baisse souvent avant le poids.',
  'Dégagez un coin de sol dès la journée : moins d’excuses à 18 h 30.',
  'Un soir raté n’est pas un échec. Reprenez simplement le lendemain.',
];