// Génération du programme par l'API Anthropic, semaine par semaine.
import { EXERCISES } from '../data/exercises';
import { LEVEL_NAMES } from '../data/program';
import { JOURS, addDays, weekdayOf } from '../utils/dates';
import { bmi } from '../utils/calc';

export const MODEL = 'claude-sonnet-5-5'; // modifiable
const API_URL = 'https://api.anthropic.com/v1/messages';
const TYPES = ['strength', 'hiit', 'walk', 'family', 'light', 'rest'];

const SYSTEM = `Tu es Mizana Coach, un coach sportif bienveillant et prudent.
Tu crées des programmes à faire à la maison, sans matériel, adaptés à un débutant en perte de poids.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour et sans balises markdown.
Tu ne donnes pas d'avis médical.`;

const catalog = () =>
  Object.entries(EXERCISES)
    .map(([id, e]) => `- ${id} : ${e.name} (${e.muscles}, difficulté ${e.lvl}/3${e.motion === 'hold' ? ', exercice tenu' : ''})`)
    .join('\n');

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

// Répétitions par série : null pour les exercices tenus ou si absent
function repsFor(id, v) {
  if (EXERCISES[id] && EXERCISES[id].motion === 'hold') return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(60, Math.max(3, n)) : null;
}

function cleanDay(d) {
  if (!d || typeof d !== 'object') return null;
  const type = TYPES.includes(d.type) ? d.type : 'light';
  const out = { type, title: str(d.title, 40), focus: str(d.focus, 160) };
  if (type === 'strength' || type === 'hiit') {
    out.rounds = Math.min(5, Math.max(1, Math.round(num(d.rounds, 3))));
    out.exercises = (Array.isArray(d.exercises) ? d.exercises : [])
      .filter((e) => e && EXERCISES[e.id])
      .slice(0, 6)
      .map((e) => ({
        id: e.id,
        work: Math.min(90, Math.max(15, Math.round(num(e.work, 40)))),
        rest: Math.min(90, Math.max(10, Math.round(num(e.rest, 20)))),
        reps: repsFor(e.id, e.reps),
        tip: str(e.tip, 140),
      }));
    if (out.exercises.length < 3) return null;
  } else {
    out.minutes = Math.min(90, Math.max(10, Math.round(num(d.minutes, 30))));
  }
  return out;
}

export function parseJSON(text) {
  const clean = String(text).replace(/```json|```/g, '').trim();
  const a = clean.indexOf('{');
  const b = clean.lastIndexOf('}');
  if (a === -1 || b === -1) throw new Error('Réponse de l’IA illisible.');
  return JSON.parse(clean.slice(a, b + 1));
}

function buildContext({ profile, sessions, weighIns, today, level }) {
  const recent = Object.entries(sessions || {})
    .filter(([d]) => d <= today && d >= addDays(today, -14))
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([d, s]) => `${d} : ${s.status === 'done' ? 'faite' : 'non faite'}${s.feeling ? ` (ressenti ${s.feeling})` : ''}`);
  const w = [...(weighIns || [])]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-4)
    .map((e) => `${e.date} : ${e.weight} kg`);
  const last = w.length ? [...weighIns].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-1)[0].weight : profile.startWeight;
  return [
    `Sexe : ${profile.sex || 'non précisé'}`,
    `Taille : ${profile.heightCm} cm, poids de départ : ${profile.startWeight} kg, poids actuel : ${last} kg, objectif : ${profile.goalWeight} kg, IMC actuel : ${bmi(last, profile.heightCm).toFixed(1)}`,
    `Niveau actuel de l’application : ${level + 1}/4 (${LEVEL_NAMES[level]})`,
    `Dernières pesées : ${w.join(' ; ') || 'aucune'}`,
    `Séances des 14 derniers jours : ${recent.join(' ; ') || 'aucune'}`,
    'Contexte : la personne a un enfant ; le samedi est idéal pour une sortie active en famille.',
  ].join('\n');
}

function buildPrompt({ context, weekStart, weekIndex, totalWeeks, prevSummary }) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return `${i} = ${JOURS[weekdayOf(date)]} ${date}`;
  }).join('\n');

  return `Crée la semaine ${weekIndex + 1} sur ${totalWeeks} d’un programme de sport.

PROFIL ET HISTORIQUE
${context}

${prevSummary ? `Semaine précédente : ${prevSummary}\n` : ''}JOURS (index d)
${dates}

CATALOGUE D’EXERCICES (utilise uniquement ces identifiants)
${catalog()}

RÈGLES
- 7 jours exactement (d de 0 à 6). Types possibles : "strength", "hiit", "walk", "family", "light", "rest".
- Environ 3 à 4 séances strength/hiit, 2 marches (walk), 1 sortie famille (family), 1 jour léger ou repos (light).
- Chaque jour doit être différent : varie les exercices et les groupes musculaires d’un jour à l’autre et d’une semaine à l’autre.
- strength/hiit : 4 à 6 exercices, "rounds" = nombre de séries (2 à 4), "work" en secondes (20 à 60), "rest" en secondes (15 à 45).
- "reps" = nombre de répétitions à viser par série, adapté au niveau et au débutant (ex. 5 pompes, 8 fentes, 12 squats). Pour les exercices tenus (planche, planche latérale, superman, chaise contre le mur) mets null. Le temps "work" doit laisser assez de temps pour faire ces répétitions.
- walk/family/light : fournis "minutes".
- Progression douce d’une semaine à l’autre ; si les retours sont "dur" ou si des séances sont manquées, allège. Si "facile", augmente un peu. Une semaine un peu plus légère toutes les 4 semaines.
- "tip" : conseil de technique court (moins de 100 caractères) en français.
- Textes en français, simples, motivants.

FORMAT JSON EXACT
{"summary":"résumé de la semaine en une phrase","days":[{"d":0,"type":"strength","title":"Jambes et gainage","focus":"phrase courte","rounds":3,"exercises":[{"id":"squat","work":40,"rest":20,"reps":12,"tip":"..."},{"id":"plank","work":30,"rest":20,"reps":null,"tip":"..."}]},{"d":1,"type":"walk","title":"Marche rapide","focus":"...","minutes":30}]}`;
}

export async function callClaude(apiKey, prompt, signal, system = SYSTEM, maxTokens = 3500) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal,
    });
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    throw new Error('Pas de connexion internet.');
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Clé Anthropic invalide. Vérifiez-la dans Réglages.');
    if (res.status === 429) throw new Error('Trop de demandes. Réessayez dans une minute.');
    const t = await res.text();
    throw new Error(`Erreur IA (${res.status}) ${t.slice(0, 120)}`);
  }
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
}

async function generateWeek(args) {
  const prompt = buildPrompt(args);
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await callClaude(args.apiKey, prompt, args.signal);
      const json = parseJSON(text);
      const days = {};
      (Array.isArray(json.days) ? json.days : []).forEach((d) => {
        const idx = Number(d && d.d);
        if (idx >= 0 && idx <= 6) {
          const c = cleanDay(d);
          if (c) days[addDays(args.weekStart, idx)] = c;
        }
      });
      if (Object.keys(days).length < 5) throw new Error('Réponse de l’IA incomplète.');
      return { days, summary: str(json.summary, 200) };
    } catch (e) {
      lastErr = e;
      if (e && e.name === 'AbortError') throw e;
      if (String(e.message).includes('Clé') || String(e.message).includes('connexion')) throw e;
    }
  }
  throw lastErr;
}

// Génère `weeks` semaines (1 appel par semaine) à partir de startDate
export async function generatePlan({ apiKey, profile, sessions, weighIns, level, startDate, weeks, onProgress, signal }) {
  const context = buildContext({ profile, sessions, weighIns, today: startDate, level });
  const days = {};
  const summaries = [];
  let prevSummary = '';
  if (onProgress) onProgress(0, weeks);
  for (let w = 0; w < weeks; w += 1) {
    const weekStart = addDays(startDate, w * 7);
    const res = await generateWeek({
      apiKey, context, weekStart, weekIndex: w, totalWeeks: weeks, prevSummary, signal,
    });
    Object.assign(days, res.days);
    summaries.push(res.summary);
    prevSummary = res.summary;
    if (onProgress) onProgress(w + 1, weeks);
  }
  return {
    createdAt: startDate,
    startDate,
    endDate: addDays(startDate, weeks * 7 - 1),
    weeks,
    summaries,
    days,
  };
}