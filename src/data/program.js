// Programme de Mizana : règles fixes (hors ligne) + programme généré par l'IA.
import { addDays, daysBetween, weekdayOf } from '../utils/dates';
import { EXERCISES } from './exercises';

export { EXERCISES };

export const FEELINGS = { facile: 'Facile', correct: 'Correct', dur: 'Trop dur' };

const WARMUP = [
  { name: 'Marche sur place', hint: 'Marchez sur place en balançant les bras, rythme tranquille.', seconds: 60, icon: 'walking' },
  { name: 'Rotations épaules et hanches', hint: 'Grands cercles avec les épaules, puis avec les hanches. Dans les deux sens.', seconds: 60, icon: 'sync-alt' },
  { name: 'Montées de genoux douces', hint: 'Rythme léger pour faire monter la chaleur du corps.', seconds: 60, icon: 'running' },
];

const COOLDOWN = [
  { name: 'Étirement des cuisses', hint: 'Debout, tirez un talon vers la fesse 20 s, puis changez de jambe.', seconds: 60, icon: 'spa' },
  { name: 'Étirement du dos et des épaules', hint: 'Bras croisés devant, puis bras tendus vers le haut. Respirez lentement.', seconds: 60, icon: 'spa' },
  { name: 'Respiration calme', hint: 'Inspirez 4 secondes, expirez 6 secondes. Laissez le rythme cardiaque redescendre.', seconds: 60, icon: 'heartbeat' },
];

// 0 = dimanche ... 6 = samedi
export const DAY_INFO = {
  1: { type: 'strength', icon: 'dumbbell', emoji: '🏋️', title: 'Jambes et gainage', desc: 'Cuisses, fessiers et ventre : les gros muscles qui consomment le plus d’énergie.' },
  2: { type: 'walk', icon: 'walking', emoji: '🚶', title: 'Marche rapide', baseMin: 30, desc: 'Rythme où vous pouvez parler mais pas chanter.' },
  3: { type: 'strength', icon: 'bolt', emoji: '💪', title: 'Haut du corps et cardio', desc: 'Bras, poitrine, ventre et un peu de cardio.' },
  4: { type: 'walk', icon: 'walking', emoji: '🚶', title: 'Marche rapide', baseMin: 30, desc: 'Un peu plus longue quand le niveau monte.' },
  5: { type: 'strength', icon: 'fire', emoji: '🔥', title: 'Corps entier', desc: 'Un peu de tout : jambes, bras, fessiers et ventre.' },
  6: { type: 'family', icon: 'users', emoji: '👨‍👧', title: 'Sortie active en famille', baseMin: 45, desc: 'Promenade, jeux dehors, vélo : bougez ensemble.' },
  0: { type: 'light', icon: 'spa', emoji: '🧘', title: 'Repos actif et pesée', baseMin: 20, desc: 'Marche douce, étirements, et pesée du dimanche.' },
};

const TYPE_META = {
  strength: { icon: 'dumbbell', emoji: '🏋️', title: 'Renforcement' },
  hiit: { icon: 'fire', emoji: '🔥', title: 'Cardio intense' },
  walk: { icon: 'walking', emoji: '🚶', title: 'Marche rapide' },
  family: { icon: 'users', emoji: '👨‍👧', title: 'Sortie active en famille' },
  light: { icon: 'spa', emoji: '🧘', title: 'Repos actif' },
  rest: { icon: 'spa', emoji: '🧘', title: 'Repos actif' },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function resolveExercises(weekday, level) {
  switch (weekday) {
    case 1:
      return ['squat', 'lunge', 'bridge', 'plank'];
    case 3:
      return [level >= 1 ? 'jacks' : 'kneeraise', level >= 2 ? 'pushup' : 'pushupKnee', 'climbers', 'plank'];
    case 5: {
      const base = ['squat', level >= 2 ? 'pushup' : 'pushupKnee', 'bridge', 'legraise'];
      if (level >= 2) base.push('climbers');
      return base;
    }
    default:
      return [];
  }
}

// items : [{ id, work, rest, tip }]
function buildStrengthSteps(items, rounds) {
  const roundRest = 45;
  const steps = [];
  WARMUP.forEach((w) => steps.push({ kind: 'warmup', ...w }));

  for (let r = 1; r <= rounds; r += 1) {
    items.forEach((it, i) => {
      const ex = EXERCISES[it.id];
      steps.push({
        kind: 'work', exId: it.id, name: ex.name, hint: ex.hint, tip: it.tip || null,
        seconds: it.work, round: r, rounds, index: i + 1, count: items.length,
      });
      const lastOfRound = i === items.length - 1;
      const veryLast = lastOfRound && r === rounds;
      if (!veryLast) {
        const nextItem = lastOfRound ? items[0] : items[i + 1];
        steps.push({
          kind: 'rest',
          name: lastOfRound ? 'Repos entre les tours' : 'Repos',
          hint: 'Respirez calmement, une gorgée d’eau si besoin.',
          seconds: lastOfRound ? roundRest : it.rest,
          round: r, rounds, previewId: nextItem.id,
        });
      }
    });
  }
  COOLDOWN.forEach((c) => steps.push({ kind: 'cool', ...c }));
  return steps;
}

function buildWalkSteps(minutes) {
  const fast = Math.max(10, minutes - 10);
  return [
    { kind: 'warmup', icon: 'walking', name: 'Marche tranquille', hint: 'Démarrez doucement, épaules relâchées.', seconds: 5 * 60 },
    { kind: 'work', icon: 'walking', name: 'Marche rapide', hint: 'Pas soutenus, bras qui balancent, dos droit. Vous pouvez parler, mais pas chanter.', seconds: fast * 60, round: 1, rounds: 1, index: 1, count: 1 },
    { kind: 'cool', icon: 'spa', name: 'Retour au calme', hint: 'Ralentissez petit à petit, respirez profondément.', seconds: 5 * 60 },
  ];
}

function buildFamilySteps(minutes) {
  return [
    { kind: 'work', icon: 'users', name: 'Marche et jeux avec l’enfant', hint: 'Marche, jeux de course, vélo, ballon… L’important : rester en mouvement.', seconds: minutes * 60, round: 1, rounds: 1, index: 1, count: 1 },
  ];
}

function buildLightSteps() {
  return [
    { kind: 'warmup', icon: 'walking', name: 'Marche douce', hint: 'Marche à rythme tranquille, sans effort.', seconds: 15 * 60 },
    { kind: 'cool', icon: 'spa', name: 'Étirements', hint: 'Jambes, dos, épaules. Tenez chaque position 20 à 30 secondes.', seconds: 5 * 60 },
  ];
}

function attachNext(steps) {
  return steps.map((s, i) => ({ ...s, next: steps[i + 1] ? steps[i + 1].name : null }));
}

// Transforme un jour généré par l'IA en étapes
function specToSteps(spec) {
  if (!spec) return null;
  if (spec.type === 'strength' || spec.type === 'hiit') {
    const items = (spec.exercises || [])
      .filter((e) => e && EXERCISES[e.id])
      .map((e) => ({
        id: e.id,
        work: clamp(Math.round(e.work || 40), 15, 90),
        rest: clamp(Math.round(e.rest || 20), 10, 90),
        tip: e.tip || null,
      }));
    if (items.length < 2) return null;
    return buildStrengthSteps(items, clamp(Math.round(spec.rounds || 3), 1, 5));
  }
  if (spec.type === 'walk') return buildWalkSteps(clamp(Math.round(spec.minutes || 30), 10, 60));
  if (spec.type === 'family') return buildFamilySteps(clamp(Math.round(spec.minutes || 45), 20, 90));
  return buildLightSteps();
}

// Plan complet d'un jour. Si l'IA a un programme pour cette date, il est utilisé.
export function getDayPlan(dateISO, level, time, aiPlan) {
  const weekday = weekdayOf(dateISO);
  const spec = aiPlan && aiPlan.days ? aiPlan.days[dateISO] : null;
  let steps = spec ? specToSteps(spec) : null;
  let meta;
  let exIds = [];

  if (steps) {
    const m = TYPE_META[spec.type] || TYPE_META.light;
    exIds = (spec.exercises || []).map((e) => e.id).filter((id) => EXERCISES[id]);
    meta = { type: spec.type, icon: m.icon, emoji: m.emoji, title: spec.title || m.title, desc: spec.focus || '', ai: true };
  } else {
    const info = DAY_INFO[weekday];
    if (info.type === 'strength') {
      exIds = resolveExercises(weekday, level);
      const work = [30, 35, 40, 45][level];
      const rest = [30, 25, 20, 20][level];
      steps = buildStrengthSteps(exIds.map((id) => ({ id, work, rest })), level >= 2 ? 4 : 3);
    } else if (info.type === 'walk') {
      steps = buildWalkSteps(Math.min(45, info.baseMin + 5 * level));
    } else if (info.type === 'family') {
      steps = buildFamilySteps(info.baseMin);
    } else {
      steps = buildLightSteps();
    }
    meta = { type: info.type, icon: info.icon, emoji: info.emoji, title: info.title, desc: info.desc, ai: false };
  }

  steps = attachNext(steps);
  const totalSeconds = steps.reduce((sum, s) => sum + s.seconds, 0);

  return {
    date: dateISO,
    weekday,
    ...meta,
    durationMin: Math.round(totalSeconds / 60),
    exIds,
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

  let missed = 0;
  for (let i = 1; i <= 7; i += 1) {
    const d = addDays(today, -i);
    if (d < startDate) continue;
    if ([1, 3, 5].includes(weekdayOf(d))) {
      const s = sessions && sessions[d];
      if (!s || s.status !== 'done') missed += 1;
    }
  }
  if (missed >= 2 && !reason) {
    level -= 1;
    reason = 'Deux séances manquées cette semaine : on reprend en douceur.';
  }

  return { level: clamp(level, 0, 3), reason, weeks };
}

export const LEVEL_NAMES = ['Démarrage', 'Progression', 'Intermédiaire', 'Confirmé'];

export const TIPS = [
  'Un verre d’eau avant chaque repas aide à manger un peu moins sans y penser.',
  'Dîner léger et au moins 2 h 30 avant le coucher : le sommeil et le ventre vous remercieront.',
  'Une marche de 10 minutes après le déjeuner aide la digestion et limite les pics de sucre.',
  'Dormir 7 h 30 réduit la faim du lendemain. Le coucher à l’heure est un vrai « exercice ».',
  'Boissons sucrées et jus : ce sont souvent les calories les plus faciles à supprimer.',
  'Dans l’assiette : un quart de féculents, un quart de protéines, la moitié de légumes.',
  'Mangez lentement : le cerveau met environ 20 minutes à comprendre qu’on est rassasié.',
  'Protéines à chaque repas (œufs, poisson, poulet, haricots secs) : elles protègent vos muscles.',
  'Une fringale à 16 h ? Un grand verre d’eau ou un thé sans sucre, puis attendez 10 minutes.',
  'Le poids varie d’un jour à l’autre. Ce qui compte, c’est la courbe sur plusieurs semaines.',
  'Se lever toutes les heures quand on est assis au travail, même 1 minute, fait une vraie différence.',
  'Posez le téléphone 30 minutes avant de dormir : l’endormissement sera plus rapide.',
  'Mesurez le tour de taille au niveau du nombril : il baisse souvent avant le poids.',
  'Préparez vos affaires de sport la veille : moins d’excuses à 18 h 30.',
  'Un jour raté n’est pas un échec. Reprenez simplement à la séance suivante.',
];