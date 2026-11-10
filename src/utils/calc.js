// Calculs de poids : IMC, écarts, rythme, estimation de la date d'objectif, alertes.
import { addDays, daysBetween } from './dates';

export const round1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function parseNum(s) {
  if (s === null || s === undefined) return NaN;
  const n = parseFloat(String(s).replace(',', '.').trim());
  return Number.isFinite(n) ? n : NaN;
}

// 93.04 -> "93" / 92.5 -> "92,5" ; withSign ajoute "+" aux valeurs positives
export function fmtKg(n, withSign = false) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const v = round1(n);
  const txt = String(v).replace('.', ',');
  return withSign && v > 0 ? `+${txt}` : txt;
}

export function bmi(weightKg, heightCm) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(v) {
  if (v < 18.5) return { label: 'Insuffisance pondérale', tone: 'warn' };
  if (v < 25) return { label: 'Poids normal', tone: 'good' };
  if (v < 30) return { label: 'Surpoids', tone: 'warn' };
  if (v < 35) return { label: 'Obésité modérée', tone: 'danger' };
  return { label: 'Obésité sévère', tone: 'danger' };
}

// Poids correspondant à un IMC donné pour une taille donnée
export function weightForBMI(heightCm, targetBmi) {
  const m = heightCm / 100;
  return targetBmi * m * m;
}

export const SEXES = { homme: 'Homme', femme: 'Femme' };

// Repères de tour de taille (OMS) : le seuil dépend du sexe
export function waistRisk(sex, waistCm) {
  if (!sex || !(waistCm > 0)) return null;
  const [mid, high] = sex === 'femme' ? [80, 88] : [94, 102];
  if (waistCm >= high) return { label: 'Risque élevé', tone: 'danger', target: mid };
  if (waistCm >= mid) return { label: 'Risque augmenté', tone: 'warn', target: mid };
  return { label: 'Dans la norme', tone: 'good', target: mid };
}

export function sortedWeighIns(list) {
  return [...(list || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function computeStats(profile, weighIns) {
  const list = sortedWeighIns(weighIns);
  if (!profile || list.length === 0) return null;

  const h = profile.heightCm;
  const start = profile.startWeight;
  const goal = profile.goalWeight;
  const first = list[0];
  const last = list[list.length - 1];
  const prev = list.length > 1 ? list[list.length - 2] : null;

  const bmiNow = bmi(last.weight, h);
  const cat = bmiCategory(bmiNow);
  const deltaPrev = prev ? last.weight - prev.weight : null;
  const deltaTotal = last.weight - start;
  const remaining = Math.max(0, last.weight - goal);
  const totalToLose = start - goal;
  const progress =
    totalToLose > 0 ? clamp((start - last.weight) / totalToLose, 0, 1) : last.weight <= goal ? 1 : 0;

  // Rythme moyen depuis la première pesée
  let perWeek = null;
  const spanDays = daysBetween(first.date, last.date);
  if (spanDays >= 7) {
    perWeek = (first.weight - last.weight) / (spanDays / 7); // positif = perte
  }

  // Estimation de la date d'objectif
  let etaISO = null;
  if (remaining > 0 && perWeek !== null && perWeek > 0.05) {
    const weeksLeft = remaining / perWeek;
    if (weeksLeft <= 104) etaISO = addDays(last.date, Math.round(weeksLeft * 7));
  }

  // Tour de taille
  const withWaist = list.filter((e) => typeof e.waist === 'number');
  let waist = null;
  if (withWaist.length > 0) {
    const wFirst = withWaist[0];
    const wLast = withWaist[withWaist.length - 1];
    waist = {
      last: wLast.waist,
      delta: withWaist.length > 1 ? wLast.waist - wFirst.waist : null,
      risk: waistRisk(profile.sex, wLast.waist),
      ratio: wLast.waist / h, // tour de taille / taille : idéalement < 0,5
    };
  }

  // Alertes et conseils
  const alerts = [];

  if (last.weight <= goal) {
    alerts.push({ tone: 'good', text: 'Objectif atteint ! Bravo. Maintenant, stabilisez votre poids avec les mêmes habitudes.' });
  }

  if (prev) {
    const days = daysBetween(prev.date, last.date);
    if (days >= 5) {
      const lossPerWeek = (prev.weight - last.weight) / (days / 7);
      if (lossPerWeek > 1.2) {
        alerts.push({
          tone: 'warn',
          text: `Perte rapide (${fmtKg(lossPerWeek)} kg par semaine). Ne vous privez pas trop : visez 0,5 à 1 kg par semaine, mangez à votre faim en protéines et légumes.`,
        });
      } else if (lossPerWeek < -0.3) {
        alerts.push({
          tone: 'info',
          text: 'Le poids a un peu remonté. C’est courant (eau, sommeil, repas du week-end). Regardez la tendance sur plusieurs semaines, pas une seule pesée.',
        });
      }
    }
  }

  if (list.length >= 3) {
    const lastThree = list.slice(-3);
    const ws = lastThree.map((e) => e.weight);
    const range = Math.max(...ws) - Math.min(...ws);
    const span = daysBetween(lastThree[0].date, lastThree[2].date);
    if (range <= 0.3 && span >= 12 && last.weight > goal) {
      alerts.push({
        tone: 'info',
        text: 'Le poids est stable depuis 2 semaines. Essayez : dormir 7 h 30, ajouter 10 minutes de marche, un dîner un peu plus léger.',
      });
    }
  }

  if (bmiNow < 18.5) {
    alerts.push({ tone: 'warn', text: 'Votre IMC est sous 18,5. Il vaut mieux arrêter de perdre du poids et en parler à un médecin.' });
  }

  return {
    count: list.length,
    first,
    last,
    prev,
    bmi: bmiNow,
    bmiLabel: cat.label,
    bmiTone: cat.tone,
    deltaPrev,
    deltaTotal,
    remaining,
    progress,
    perWeek,
    etaISO,
    waist,
    alerts,
  };
}
