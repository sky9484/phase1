'use client';

import { useEffect, useState } from 'react';

/**
 * Global colour theme (distinct from next-themes light/dark). Drives the
 * `[data-dash-theme="..."]` CSS overrides in globals.css, applied on
 * `document.documentElement` so EVERY page (landing, auth, admin, dashboard)
 * reflects the active theme.
 */
export type DashTheme = 'default' | 'navy' | 'teal' | 'azure';

export const DASH_THEME_KEY = 'dashboardTheme';
export const DASH_THEME_EVENT = 'dash-theme-change';
export const DASH_THEMES_LIST: DashTheme[] = ['default', 'navy', 'teal', 'azure'];

export const THEMES: { id: DashTheme; label: string; colors: [string, string, string] }[] = [
  { id: 'default', label: 'Splash',     colors: ['#1F4452', '#5C9EAD', '#E39774'] },
  { id: 'navy',    label: 'Navy Blue',  colors: ['#1E3888', '#47A8BD', '#FFAD69'] },
  { id: 'teal',    label: 'Ocean Teal', colors: ['#0FA692', '#37AD9E', '#FC8F12'] },
  { id: 'azure',   label: 'Azure Sky',  colors: ['#022B3A', '#1F7A8C', '#2384E4'] },
];

export function isDashTheme(value: unknown): value is DashTheme {
  return typeof value === 'string' && (DASH_THEMES_LIST as string[]).includes(value);
}

export function getStoredDashTheme(): DashTheme {
  if (typeof window === 'undefined') return 'default';
  const saved = window.localStorage.getItem(DASH_THEME_KEY);
  return isDashTheme(saved) ? saved : 'default';
}

/** Apply a theme everywhere: <html> attribute, localStorage, and notify listeners. */
export function applyDashTheme(theme: DashTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dash-theme', theme);
  try {
    window.localStorage.setItem(DASH_THEME_KEY, theme);
  } catch {
    /* storage may be unavailable (private mode) — attribute still applies */
  }
  window.dispatchEvent(new CustomEvent(DASH_THEME_EVENT, { detail: theme }));
}

/** Subscribe to the active theme and get a setter that applies it globally. */
export function useDashTheme(): [DashTheme, (theme: DashTheme) => void] {
  const [theme, setThemeState] = useState<DashTheme>('default');

  useEffect(() => {
    setThemeState(getStoredDashTheme());

    function onChange(e: Event) {
      const next = (e as CustomEvent<DashTheme>).detail;
      if (isDashTheme(next)) setThemeState(next);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === DASH_THEME_KEY && isDashTheme(e.newValue)) setThemeState(e.newValue);
    }

    window.addEventListener(DASH_THEME_EVENT, onChange);
    window.addEventListener('storage', onStorage); // sync across tabs
    return () => {
      window.removeEventListener(DASH_THEME_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return [theme, applyDashTheme];
}
