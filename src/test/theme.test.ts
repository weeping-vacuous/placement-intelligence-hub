import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, resolveTheme } from "@/lib/theme";

describe("theme preference", () => {
  it("defaults to dark mode for new visitors", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(resolveTheme(null)).toBe("dark");
  });
  it("preserves an explicit light-mode preference", () => {
    expect(resolveTheme("light")).toBe("light");
  });
});