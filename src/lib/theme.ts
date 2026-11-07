/**
 * Light / dark / system theme. The choice lives in this browser only (localStorage,
 * "aib-theme"); nothing is sent anywhere. THEME_BOOT runs in <head> before first paint so
 * the page never flashes the wrong colours; the toggle calls setTheme().
 */
export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "aib-theme";

/** Inline, dependency-free: sets html[data-theme] and the .dark class from the saved choice. */
export const THEME_BOOT = `(function(){try{var c=localStorage.getItem("${THEME_KEY}")}catch(e){}var m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");function a(){var d=c==="dark"||(c!=="light"&&m&&m.matches);var h=document.documentElement;h.dataset.theme=d?"dark":"light";h.classList.toggle("dark",d)}a();document.documentElement.classList.add("reveal-ready");if(m&&m.addEventListener)m.addEventListener("change",function(){try{c=localStorage.getItem("${THEME_KEY}")}catch(e){}a()})})();`;

export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolvedDark(choice: ThemeChoice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  const h = document.documentElement;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    h.classList.add("theme-swap");
    window.setTimeout(() => h.classList.remove("theme-swap"), 320);
  }
  const dark = resolvedDark(choice);
  h.dataset.theme = dark ? "dark" : "light";
  h.classList.toggle("dark", dark);
}
