"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import InfoIcon from "@mui/icons-material/Info";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { type ThemeMode, useThemeMode } from "@/components/mui-theme-provider";
import type { SurveySlug, SurveySummary } from "@/lib/surveys";

interface AppMenusProps {
  showDeleteAction: boolean;
  selectedUser: boolean;
  deleting: boolean;
  moreMenuAnchor: HTMLElement | null;
  themeMenuAnchor: HTMLElement | null;
  surveysMenuAnchor: HTMLElement | null;
  pastSurveysMenuAnchor: HTMLElement | null;
  activeSurveys: SurveySummary[];
  pastSurveys: SurveySummary[];
  closeMoreMenu: () => void;
  setThemeMenuAnchor: (anchor: HTMLElement | null) => void;
  setSurveysMenuAnchor: (anchor: HTMLElement | null) => void;
  setPastSurveysMenuAnchor: (anchor: HTMLElement | null) => void;
  onDeleteSelected: () => void | Promise<void>;
  onOpenEmailsDialog: () => void | Promise<void>;
  onExportMailingLabels: () => void;
  onOpenSurvey: (slug: SurveySlug) => void | Promise<void>;
  onOpenAboutDialog: () => void;
  onLogout: () => void | Promise<void>;
}

export function AppMenus({
  showDeleteAction,
  selectedUser,
  deleting,
  moreMenuAnchor,
  themeMenuAnchor,
  surveysMenuAnchor,
  pastSurveysMenuAnchor,
  activeSurveys,
  pastSurveys,
  closeMoreMenu,
  setThemeMenuAnchor,
  setSurveysMenuAnchor,
  setPastSurveysMenuAnchor,
  onDeleteSelected,
  onOpenEmailsDialog,
  onExportMailingLabels,
  onOpenSurvey,
  onOpenAboutDialog,
  onLogout,
}: AppMenusProps): React.JSX.Element {
  const {
    mode: themeMode,
    resolvedMode,
    setMode: setThemeMode,
  } = useThemeMode();
  const hasPastSurveys = pastSurveys.length > 0;

  const closeNestedMenus = (): void => {
    setThemeMenuAnchor(null);
    setSurveysMenuAnchor(null);
    setPastSurveysMenuAnchor(null);
  };

  const runMoreAction = (action: () => void | Promise<void>): void => {
    closeMoreMenu();
    void action();
  };

  const setThemeModeAndClose = (nextMode: ThemeMode): void => {
    closeMoreMenu();
    setThemeMode(nextMode);
  };

  const openThemeMenu = (anchor: HTMLElement): void => {
    setSurveysMenuAnchor(null);
    setPastSurveysMenuAnchor(null);
    setThemeMenuAnchor(anchor);
  };

  const openSurveysMenu = (anchor: HTMLElement): void => {
    setThemeMenuAnchor(null);
    setPastSurveysMenuAnchor(null);
    setSurveysMenuAnchor(anchor);
  };

  const openPastSurveysMenu = (anchor: HTMLElement): void => {
    setPastSurveysMenuAnchor(anchor);
  };

  return (
    <>
      <Menu
        id="app-actions-menu"
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => {
          closeNestedMenus();
          closeMoreMenu();
        }}
        slotProps={{ list: { "aria-label": "More application actions" } }}
      >
        {showDeleteAction ? (
          <MenuItem
            onClick={() => runMoreAction(onDeleteSelected)}
            disabled={!selectedUser || deleting}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            {deleting ? "Deleting…" : "Delete member"}
          </MenuItem>
        ) : null}

        {!showDeleteAction ? (
          <>
            <MenuItem onClick={() => runMoreAction(onOpenEmailsDialog)}>
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              E-mail list
            </MenuItem>
            <MenuItem onClick={() => runMoreAction(onExportMailingLabels)}>
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              Mailing labels
            </MenuItem>
            <MenuItem onClick={() => runMoreAction(onOpenAboutDialog)}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              About
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={(event) => openSurveysMenu(event.currentTarget)}
              onMouseEnter={(event) => openSurveysMenu(event.currentTarget)}
              aria-haspopup="menu"
              aria-controls={surveysMenuAnchor ? "surveys-menu" : undefined}
              aria-expanded={surveysMenuAnchor ? "true" : undefined}
            >
              <ListItemIcon>
                <HowToVoteIcon fontSize="small" />
              </ListItemIcon>
              Surveys
              <ChevronRightIcon fontSize="small" sx={{ ml: "auto" }} />
            </MenuItem>
            <MenuItem
              onClick={(event) => openThemeMenu(event.currentTarget)}
              onMouseEnter={(event) => openThemeMenu(event.currentTarget)}
              aria-haspopup="menu"
              aria-controls={themeMenuAnchor ? "theme-mode-menu" : undefined}
              aria-expanded={themeMenuAnchor ? "true" : undefined}
            >
              <ListItemIcon>
                <SettingsBrightnessIcon fontSize="small" />
              </ListItemIcon>
              Theme
              <ChevronRightIcon fontSize="small" sx={{ ml: "auto" }} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => runMoreAction(onLogout)}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </>
        ) : null}
      </Menu>

      <Menu
        id="surveys-menu"
        anchorEl={surveysMenuAnchor}
        open={Boolean(surveysMenuAnchor)}
        onClose={() => {
          setSurveysMenuAnchor(null);
          setPastSurveysMenuAnchor(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ list: { "aria-label": "Surveys menu" } }}
      >
        {activeSurveys.length > 0 ? (
          activeSurveys.map((survey) => (
            <MenuItem
              key={survey.slug}
              onClick={() => runMoreAction(() => onOpenSurvey(survey.slug))}
            >
              {survey.title}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No active surveys</MenuItem>
        )}

        {hasPastSurveys ? (
          <>
            <Divider />
            <MenuItem
              onClick={(event) => openPastSurveysMenu(event.currentTarget)}
              onMouseEnter={(event) => openPastSurveysMenu(event.currentTarget)}
              aria-haspopup="menu"
              aria-controls={
                pastSurveysMenuAnchor ? "past-surveys-menu" : undefined
              }
              aria-expanded={pastSurveysMenuAnchor ? "true" : undefined}
            >
              Past surveys
              <ChevronRightIcon fontSize="small" sx={{ ml: "auto" }} />
            </MenuItem>
          </>
        ) : null}
      </Menu>

      {hasPastSurveys ? (
        <Menu
          id="past-surveys-menu"
          anchorEl={pastSurveysMenuAnchor}
          open={Boolean(pastSurveysMenuAnchor)}
          onClose={() => setPastSurveysMenuAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ list: { "aria-label": "Past surveys menu" } }}
        >
          {pastSurveys.map((survey) => (
            <MenuItem
              key={survey.slug}
              onClick={() => runMoreAction(() => onOpenSurvey(survey.slug))}
            >
              {survey.title}
            </MenuItem>
          ))}
        </Menu>
      ) : null}

      <Menu
        id="theme-mode-menu"
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={() => setThemeMenuAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ list: { "aria-label": "Theme mode" } }}
      >
        <MenuItem
          selected={themeMode === "light"}
          onClick={() => setThemeModeAndClose("light")}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          Light
        </MenuItem>
        <MenuItem
          selected={themeMode === "dark"}
          onClick={() => setThemeModeAndClose("dark")}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          Dark
        </MenuItem>
        <MenuItem
          selected={themeMode === "system"}
          onClick={() => setThemeModeAndClose("system")}
        >
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          System ({resolvedMode})
        </MenuItem>
      </Menu>
    </>
  );
}
