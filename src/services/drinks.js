// Génération des boissons naturelles (1 à 3 jours) par l'API Anthropic, en un seul appel.
import { callClaude, parseJSON } from './ai';
import { LEVEL_NAMES } from '../data/program';
import { JOURS, addDays, weekdayOf } from '../utils/dates';
import { bmi } from '../utils/calc';

const SYSTEM = `Tu es Mizana Nutri, un conseiller bienveillant et prudent.
Tu proposes des boissons 100 % naturelles (fruits, légumes, herbes, épices, eau, infusions) qui accompagnent une perte de poids saine.
Tu ne dis jamais qu'une boisson brûle la graisse à elle seule : elle aide, avec le sport et une alimentation équilibrée.
Aucun sucre ajouté, aucun édulcorant, aucun additif.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour et sans balises markdown.
Tu ne donnes pas d'avis médical.`;

const TYPES = ['mixer', 'presser', 'infusion', 'acheter'];
const ICONS = ['lemon', 'leaf', 'apple-alt', 'carrot', 'seedling', 'tint', 'mug-hot', 'blender'];

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

function cleanDrink(d) {
  if (!d || typeof d !== 'object') return null;
  const name = str(d.name, 60);
  if (!name) return null;
  const ingredients = (Array.isArray(d.ingredients) ? d.ingredients : [])
    .filter((i) => i && str(i.item, 40))
    .slice(0, 10)
    .map((i) => ({ item: str(i.item, 40), qty: str(i.qty, 30) }));
  const steps = (Array.isArray(d.steps) ? d.steps : []).map((s) => str(s, 200)).filter(Boolean).slice(0, 6);
  return {
    name,
    type: TYPES.includes(d.type) ? d.type : 'mixer',
    icon: ICONS.includes(d.icon) ? d.icon : 'blender',
    goal: str(d.goal, 220),
    when: str(d.when, 60),
    minutes: Math.min(30, Math.max(0, Math.round(num(d.minutes, 5)))),
    ingredients,
    steps,
    buy: str(d.buy, 220),
    tip: str(d.tip, 160),
  };
}

function buildContext({ profile, weighIns, level }) {
  const sorted = [...(weighIns || [])].sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = sorted.length ? sorted[sorted.length - 1].weight : profile.startWeight;
  return [
    `Sexe : ${profile.sex || 'non précisé'}`,
    `Taille : ${profile.heightCm} cm, poids actuel : ${last} kg, objectif : ${profile.goalWeight} kg, IMC actuel : ${bmi(last, profile.heightCm).toFixed(1)}`,
    `Niveau sportif de l’application : ${level + 1}/4 (${LEVEL_NAMES[level]})`,
  ].join('\n');
}

function buildPrompt({ context, startDate, days, mode, avoid }) {
  const dates = Array.from({ length: days }, (_, i) => {
    const date = addDays(startDate, i);
    return `${i} = ${JOURS[weekdayOf(date)]} ${date}`;
  }).join('\n');

  const modeText =
    mode === 'maison'
      ? 'Toutes les boissons sont à préparer à la maison (mixeur, presse-agrumes ou infusion). "type" vaut "mixer", "presser" ou "infusion". Le champ "buy" peut rester vide.'
      : mode === 'acheter'
      ? 'Toutes les boissons sont à acheter déjà prêtes mais naturelles (jus 100 % pur sans sucre ajouté, eau de coco nature, thé ou infusion...). "type" vaut "acheter". "ingredients" et "steps" peuvent être vides. "buy" explique quoi choisir et quoi vérifier sur l’étiquette.'
      : 'Pour chaque jour, propose une recette à préparer à la maison (type "mixer", "presser" ou "infusion") ET, dans "buy", une option naturelle à acheter si la personne n’a pas le temps.';

  return `Crée ${days} boisson(s) naturelle(s) pour ${days} jour(s), une par jour, pour aider à brûler la graisse avec le sport (sans promesse miracle).

PROFIL
${context}

JOURS (index d)
${dates}

MODE
${modeText}

RÈGLES
- Une boisson différente chaque jour, avec des goûts différents.
${avoid && avoid.length ? `- Évite de reprendre ces boissons déjà proposées : ${avoid.join(' ; ')}.\n` : ''}- Ingrédients simples, faciles à trouver sur les marchés locaux de Madagascar (ananas, citron, gingembre, concombre, papaye, carotte, pomme, banane, goyave, citronnelle, menthe, curcuma...).
- Aucun sucre ajouté, aucun édulcorant. Quantités précises pour 1 grand verre ou 1 portion.
- "goal" : en une phrase, pourquoi cette boisson aide (hydratation, fibres, satiété, gingembre/citron...), sans exagérer.
- "when" : moment idéal (ex. "Au réveil", "En collation à 16 h", "Après la séance").
- "minutes" : temps de préparation (0 si à acheter).
- "steps" : 2 à 5 étapes courtes. "tip" : un conseil court.
- "icon" parmi : ${ICONS.join(', ')}.
- Textes en français, simples, motivants.

FORMAT JSON EXACT
{"drinks":[{"d":0,"name":"Jus vert citron-gingembre","type":"mixer","icon":"leaf","goal":"phrase courte","when":"Au réveil","minutes":5,"ingredients":[{"item":"Concombre","qty":"1/2"},{"item":"Citron","qty":"1 jus"}],"steps":["Lavez les légumes.","Mixez avec 20 cl d’eau fraîche."],"buy":"option à acheter ou vide","tip":"conseil court"}]}`;
}

export async function generateDrinks({ apiKey, profile, weighIns, level, startDate, days, mode, avoid, signal }) {
  const prompt = buildPrompt({ context: buildContext({ profile, weighIns, level }), startDate, days, mode, avoid });
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await callClaude(apiKey, prompt, signal, SYSTEM, 3000);
      const json = parseJSON(text);
      const drinks = {};
      (Array.isArray(json.drinks) ? json.drinks : []).forEach((d) => {
        const idx = Number(d && d.d);
        if (idx >= 0 && idx < days) {
          const c = cleanDrink(d);
          if (c) drinks[addDays(startDate, idx)] = c;
        }
      });
      if (Object.keys(drinks).length < days) throw new Error('Réponse de l’IA incomplète.');
      return {
        createdAt: startDate,
        startDate,
        endDate: addDays(startDate, days - 1),
        days,
        mode,
        drinks,
      };
    } catch (e) {
      lastErr = e;
      if (e && e.name === 'AbortError') throw e;
      if (String(e.message).includes('Clé') || String(e.message).includes('connexion')) throw e;
    }
  }
  throw lastErr;
}