import { DASH_THEME_KEY, DASH_THEMES_LIST } from '@/components/dash-theme';

/**
 * Inline, render-blocking script that applies the saved colour theme to
 * <html> before first paint — prevents a flash of the default theme on any
 * page (landing, auth, admin, dashboard). Mirrors the next-themes approach.
 */
export default function ThemeInitScript() {
  const js = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    DASH_THEME_KEY,
  )});var allowed=${JSON.stringify(
    DASH_THEMES_LIST,
  )};if(t&&allowed.indexOf(t)!==-1){document.documentElement.setAttribute('data-dash-theme',t);}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
