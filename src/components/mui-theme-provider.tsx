"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_MODE_STORAGE_KEY = "family-theme-mode";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeModeContextValue {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within MuiThemeProvider.");
  }

  return context;
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (
    storedMode === "light" ||
    storedMode === "dark" ||
    storedMode === "system"
  ) {
    return storedMode;
  }

  return "system";
}

function createAppTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#74C69D" : "#146B3A",
        dark: "#0B4F2D",
        light: "#A7D9B8",
      },
      secondary: {
        main: isDark ? "#F2B66D" : "#C96A1B",
        dark: "#9D4D12",
        light: "#F5C98F",
      },
      background: {
        default: isDark ? "#0C1712" : "#F6F1E7",
        paper: isDark ? "#14231C" : "#FFFCF6",
      },
      divider: isDark ? "rgba(214, 229, 219, 0.16)" : "rgba(20, 107, 58, 0.16)",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      fontSize: 16,
      h1: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        letterSpacing: "-0.025em",
      },
      h2: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
      },
      h4: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
      },
      h5: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
      },
      h6: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0C1712" : "#F6F1E7",
            backgroundImage: isDark
              ? "radial-gradient(circle at 14% 4%, rgba(69, 140, 96, 0.12), transparent 34%), radial-gradient(circle at 90% 92%, rgba(201, 106, 27, 0.07), transparent 30%)"
              : "radial-gradient(circle at 14% 4%, rgba(20, 107, 58, 0.09), transparent 34%), radial-gradient(circle at 90% 92%, rgba(201, 106, 27, 0.08), transparent 30%)",
            backgroundAttachment: "fixed",
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          enableColorOnDark: true,
        },
        styleOverrides: {
          root: {
            backgroundColor: "#0B4F2D",
            backgroundImage:
              "linear-gradient(120deg, #083D24 0%, #146B3A 58%, #1B7742 100%)",
            boxShadow: "0 8px 28px rgba(4, 39, 22, 0.2)",
            borderBottom: "3px solid #E5A04B",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            textTransform: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.025)"
              : "rgba(255, 255, 255, 0.64)",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: "3px 3px 0 0",
            backgroundColor: isDark ? "#F2B66D" : "#C96A1B",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            textTransform: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  });
}

export function MuiThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>(getInitialThemeMode);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });
  const resolvedMode =
    mode === "system" ? (prefersDarkMode ? "dark" : "light") : mode;
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      resolvedMode,
      setMode,
    }),
    [mode, resolvedMode],
  );

  return (
    <AppRouterCacheProvider>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
