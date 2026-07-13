"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#009688",
    },
    secondary: {
      main: "#3f51b5",
    },
  },
  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  },
});

export function MuiThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
