// Stockage local sur le téléphone avec AsyncStorage (aucun serveur, aucun compte).
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = 'mizana:v1';

export const DEFAULT_SETTINGS = {
  reminders: {
    water: true,
    lunchWalk: true,
    workout: true,
    dinner: true,
    bedtime: true,
    weigh: true,
  },
  times: {
    wake: '06:00',
    lunchWalk: '12:45',
    workout: '18:30',
    dinner: '19:30',
    bedtime: '22:30',
    weigh: '07:30',
  },
};

export function mergeSettings(saved) {
  return {
    reminders: { ...DEFAULT_SETTINGS.reminders, ...((saved && saved.reminders) || {}) },
    times: { ...DEFAULT_SETTINGS.times, ...((saved && saved.times) || {}) },
  };
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveState(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // on ignore : l'app continue de fonctionner en mémoire
  }
}

export async function clearState() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
