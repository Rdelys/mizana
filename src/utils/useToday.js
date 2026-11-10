import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayISO } from './dates';

// Date du jour, mise à jour au passage de minuit et au retour dans l'application
export default function useToday() {
  const [today, setToday] = useState(todayISO());

  useEffect(() => {
    const refresh = () => setToday((prev) => {
      const now = todayISO();
      return now !== prev ? now : prev;
    });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    const id = setInterval(refresh, 60000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  return today;
}
