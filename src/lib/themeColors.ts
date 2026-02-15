export type AppTheme = "light" | "dark" | "purple"

type ThemePalette = {
  raysColor: string
}

const DEFAULT_THEME: AppTheme = "dark"

export const themeColors: Record<AppTheme, ThemePalette> = {
  light: {
    raysColor: "#b58900",
  },
  dark: {
    raysColor: "#00ffff",
  },
  purple: {
    raysColor: "#b58900",
  },
}

export function getThemeColors(theme?: string): ThemePalette {
  if (theme === "light" || theme === "dark" || theme === "purple") {
    return themeColors[theme]
  }

  return themeColors[DEFAULT_THEME]
}
