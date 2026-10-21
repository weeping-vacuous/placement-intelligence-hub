export type Theme = "dark" | "light";
export const DEFAULT_THEME: Theme = "dark";
export function resolveTheme(value: string | null): Theme {
  return value === "light" ? "light" : DEFAULT_THEME;
}