// Utilitaires de dates (heure locale). Les dates sont stockées en "YYYY-MM-DD".

const pad = (n) => String(n).padStart(2, '0');

export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
export const MOIS_COURTS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Midi local pour éviter les soucis de changement d'heure
export function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a, b) {
  return Math.round((fromISO(b) - fromISO(a)) / 86400000);
}

// 0 = dimanche ... 6 = samedi
export function weekdayOf(iso) {
  return fromISO(iso).getDay();
}

export function mondayOf(iso) {
  const wd = weekdayOf(iso);
  const diff = wd === 0 ? -6 : 1 - wd;
  return addDays(iso, diff);
}

export function nextSunday(iso) {
  const wd = weekdayOf(iso);
  return addDays(iso, wd === 0 ? 0 : 7 - wd);
}

export function dayOfYear(iso) {
  const y = fromISO(iso).getFullYear();
  return daysBetween(`${y}-01-01`, iso);
}

export function formatLong(iso) {
  const d = fromISO(iso);
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function formatShort(iso) {
  const d = fromISO(iso);
  return `${d.getDate()} ${MOIS_COURTS[d.getMonth()]}`;
}

export function formatShortYear(iso) {
  const d = fromISO(iso);
  return `${d.getDate()} ${MOIS_COURTS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDayMonth(iso) {
  const d = fromISO(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

// ---------- Heures "HH:MM" ----------

export function parseHHMM(s) {
  const [h, m] = s.split(':').map(Number);
  return { h, m };
}

export function minutesOf(s) {
  const { h, m } = parseHHMM(s);
  return h * 60 + m;
}

export function fmtHHMM(h, m) {
  return `${pad(h)}:${pad(m)}`;
}

export function shiftTime(s, deltaMin) {
  let t = (minutesOf(s) + deltaMin) % 1440;
  if (t < 0) t += 1440;
  return fmtHHMM(Math.floor(t / 60), t % 60);
}

// Durée de sommeil en minutes entre un coucher et un réveil
export function sleepMinutes(bed, wake) {
  let d = minutesOf(wake) - minutesOf(bed);
  if (d <= 0) d += 1440;
  return d;
}

export function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${pad(m)}`;
}

export function formatMMSS(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}
