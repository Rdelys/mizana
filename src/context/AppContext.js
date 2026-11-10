// État global de Mizana, sauvegardé automatiquement dans AsyncStorage.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { DEFAULT_SETTINGS, clearState, loadState, mergeSettings, saveState } from '../storage';

const AppContext = createContext(null);

const initialState = {
  ready: false,
  profile: null,
  weighIns: [],
  sessions: {},
  settings: DEFAULT_SETTINGS,
  aiPlan: null, // { startDate, endDate, weeks, summaries, days: { 'YYYY-MM-DD': spec } }
  aiKey: '', // clé Anthropic saisie par l'utilisateur
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const d = action.payload || {};
      return {
        ready: true,
        profile: d.profile || null,
        weighIns: Array.isArray(d.weighIns) ? d.weighIns : [],
        sessions: d.sessions && typeof d.sessions === 'object' ? d.sessions : {},
        settings: mergeSettings(d.settings),
        aiPlan: d.aiPlan || null,
        aiKey: typeof d.aiKey === 'string' ? d.aiKey : '',
      };
    }
    case 'SET_PROFILE':
      return { ...state, profile: { ...(state.profile || {}), ...action.payload } };
    case 'SAVE_WEIGHIN': {
      const entry = action.payload;
      const others = state.weighIns.filter((w) => w.date !== entry.date);
      const next = [...others, entry].sort((a, b) => (a.date < b.date ? -1 : 1));
      return { ...state, weighIns: next };
    }
    case 'DELETE_WEIGHIN':
      return { ...state, weighIns: state.weighIns.filter((w) => w.date !== action.payload) };
    case 'SET_SESSION': {
      const { date, session } = action.payload;
      const sessions = { ...state.sessions };
      if (session) sessions[date] = session;
      else delete sessions[date];
      return { ...state, sessions };
    }
    case 'SET_SETTINGS': {
      const p = action.payload;
      return {
        ...state,
        settings: {
          reminders: { ...state.settings.reminders, ...(p.reminders || {}) },
          times: { ...state.settings.times, ...(p.times || {}) },
        },
      };
    }
    case 'SET_AI_PLAN':
      return { ...state, aiPlan: action.payload };
    case 'SET_AI_KEY':
      return { ...state, aiKey: action.payload };
    case 'RESET':
      return { ...initialState, ready: true };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let alive = true;
    loadState().then((data) => {
      if (alive) dispatch({ type: 'HYDRATE', payload: data });
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    saveState({
      profile: state.profile,
      weighIns: state.weighIns,
      sessions: state.sessions,
      settings: state.settings,
      aiPlan: state.aiPlan,
      aiKey: state.aiKey,
    });
  }, [state.ready, state.profile, state.weighIns, state.sessions, state.settings, state.aiPlan, state.aiKey]);

  const saveProfile = useCallback((p) => dispatch({ type: 'SET_PROFILE', payload: p }), []);
  const saveWeighIn = useCallback((e) => dispatch({ type: 'SAVE_WEIGHIN', payload: e }), []);
  const deleteWeighIn = useCallback((date) => dispatch({ type: 'DELETE_WEIGHIN', payload: date }), []);
  const setSession = useCallback((date, session) => dispatch({ type: 'SET_SESSION', payload: { date, session } }), []);
  const updateSettings = useCallback((p) => dispatch({ type: 'SET_SETTINGS', payload: p }), []);
  const setAiPlan = useCallback((plan) => dispatch({ type: 'SET_AI_PLAN', payload: plan }), []);
  const setAiKey = useCallback((key) => dispatch({ type: 'SET_AI_KEY', payload: key }), []);
  const reset = useCallback(async () => {
    await clearState();
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo(
    () => ({ state, saveProfile, saveWeighIn, deleteWeighIn, setSession, updateSettings, setAiPlan, setAiKey, reset }),
    [state, saveProfile, saveWeighIn, deleteWeighIn, setSession, updateSettings, setAiPlan, setAiKey, reset]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}