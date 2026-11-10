// Rappels locaux (eau, séance, dîner, coucher, pesée) avec expo-notifications.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY_INFO } from './data/program';
import { parseHHMM, shiftTime } from './utils/dates';

const CHANNEL_ID = 'mizana-rappels';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Rappels Mizana',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.status === 'granted') return true;
    const asked = await Notifications.requestPermissionsAsync();
    return !!(asked.granted || asked.status === 'granted');
  } catch (e) {
    return false;
  }
}

const WATER_REMINDERS = [
  { time: '06:00', body: 'Un grand verre d’eau au réveil.' },
  { time: '09:30', body: 'Pensez à boire un verre d’eau.' },
  { time: '11:00', body: 'Un verre d’eau avant le déjeuner aide à manger un peu moins.' },
  { time: '14:30', body: 'Bouteille d’eau : où en êtes-vous ?' },
  { time: '16:30', body: 'Finissez votre bouteille avant de sortir du travail.' },
];

// Construit la liste des rappels à partir des réglages
export function buildReminders(settings) {
  const { reminders, times } = settings;
  const list = [];

  if (reminders.water) {
    WATER_REMINDERS.forEach((w) =>
      list.push({ title: '💧 Eau', body: w.body, time: w.time })
    );
  }

  if (reminders.lunchWalk) {
    list.push({
      title: '🚶 Marche après le repas',
      body: '10 minutes de marche tranquille aident la digestion.',
      time: times.lunchWalk,
    });
  }

  if (reminders.workout) {
    for (let wd = 0; wd <= 6; wd += 1) {
      const info = DAY_INFO[wd];
      list.push({
        title: `${info.emoji} ${info.title}`,
        body: 'C’est l’heure de votre séance du jour. Ouvrez Mizana pour la lancer.',
        time: times.workout,
        weekday: wd + 1, // Expo : 1 = dimanche ... 7 = samedi
      });
    }
  }

  if (reminders.dinner) {
    list.push({
      title: '🥗 Dîner léger',
      body: 'Légumes, protéines, riz en petite portion. Mangez lentement.',
      time: times.dinner,
    });
  }

  if (reminders.bedtime) {
    list.push({
      title: '📵 Bientôt l’heure de dormir',
      body: 'Dans 30 minutes : écrans éteints, préparez-vous à dormir.',
      time: shiftTime(times.bedtime, -30),
    });
    list.push({
      title: '😴 Heure de dormir',
      body: 'Au lit ! Le sommeil fait partie du programme.',
      time: times.bedtime,
    });
  }

  if (reminders.weigh) {
    list.push({
      title: '⚖️ Pesée du dimanche',
      body: 'Pesez-vous à jeun, avant le petit-déjeuner, et notez le résultat dans Mizana.',
      time: times.weigh,
      weekday: 1,
    });
  }

  return list;
}

export async function scheduleAll(settings) {
  const ok = await ensurePermission();
  if (!ok) return { ok: false, count: 0 };

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // ignore
  }

  const items = buildReminders(settings);
  let count = 0;

  for (const it of items) {
    const { h, m } = parseHHMM(it.time);
    const trigger = it.weekday
      ? {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: it.weekday,
          hour: h,
          minute: m,
          channelId: CHANNEL_ID,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: m,
          channelId: CHANNEL_ID,
        };
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: it.title, body: it.body, sound: true },
        trigger,
      });
      count += 1;
    } catch (e) {
      // on continue avec les autres rappels
    }
  }

  return { ok: true, count };
}

export async function cancelAll() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // ignore
  }
}

export async function sendTestNotification() {
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: '✅ Mizana', body: 'Les rappels fonctionnent.', sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}
