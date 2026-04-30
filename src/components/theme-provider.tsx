import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, type LucideIcon } from "lucide-react";

export type Theme = {
  name: string;
  value: string;
  icon: LucideIcon;
};

export const themes: Record<string, Theme> = {
  light: {
    name: "Light",
    value: "light",
    icon: Sun,
  },
  dark: {
    name: "Dark",
    value: "dark",
    icon: Moon,
  },
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: themes.light,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = themes.light,
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (typeof parsed === "string") {
          return themes[parsed] || defaultTheme;
        }
        // If it's an object, we still might need to map the icon back because components aren't serializable
        if (parsed && typeof parsed === "object" && parsed.value) {
          return themes[parsed.value] || defaultTheme;
        }
      } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    root.classList.add(theme.value);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, JSON.stringify(theme.value)); // Store just the value for simplicity
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
