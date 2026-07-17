"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/family/app-dialogs";
import { AppMenus } from "@/components/family/app-menus";
import { BrowseSearchProvider } from "@/components/family/browse-search-context";
import { BrowseShell } from "@/components/family/browse-shell";
import { EditorShell } from "@/components/family/editor-shell";
import { FamilyAppBar } from "@/components/family/family-app-bar";
import { LoginScreen } from "@/components/family/login-screen";
import {
  useDeleteMemberMutation,
  useLoginMutation,
  useLogoutMutation,
  useMembersQuery,
  useParentsQuery,
  useSaveMemberMutation,
  useSessionQuery,
} from "@/hooks/use-family-data";
import { useFamilyNavigation } from "@/hooks/use-family-navigation";
import { useMemberEditor } from "@/hooks/use-member-editor";
import { useSurveyLifecycle } from "@/hooks/use-survey-lifecycle";
import {
  buildParentSelectOptions,
  hasRequiredMemberFields,
  parseTabKey,
  type TabKey,
} from "@/lib/family-editor";
import { buildDisplayNameOptions, formatMemberName } from "@/lib/member-utils";
import { fetchEmails, isUnauthorizedError } from "@/lib/queries/family-api";
import { familyKeys } from "@/lib/queries/query-keys";
import type { FamilyMemberRecord, ParentOption } from "@/lib/types";

const AboutDialog = dynamic(
  () =>
    import("@/components/family/app-dialogs").then((module) => ({
      default: module.AboutDialog,
    })),
  { ssr: false },
);

const EmailsDialog = dynamic(
  () =>
    import("@/components/family/app-dialogs").then((module) => ({
      default: module.EmailsDialog,
    })),
  { ssr: false },
);

const EMPTY_MEMBERS: FamilyMemberRecord[] = [];
const DEFAULT_PARENT_OPTIONS: ParentOption[] = [
  { id: "", firstName: "", lastName: "" },
];
const EMPTY_DISPLAY_NAME_OPTIONS: string[] = [];

function displayNameSignature(member: FamilyMemberRecord | null): string {
  if (!member) {
    return "";
  }

  return [
    member.firstName,
    member.middleName,
    member.lastName,
    member.maidenName,
    member.titleName,
    member.suffixName,
    member.nickName,
    member.firstNameSpouse,
    member.middleNameSpouse,
    member.lastNameSpouse,
    member.maidenNameSpouse,
    member.titleNameSpouse,
    member.suffixNameSpouse,
    member.nickNameSpouse,
  ]
    .map((value) => String(value ?? ""))
    .join("\0");
}

export function FamilyApp(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ id?: string }>();
  const routeMemberId = typeof params.id === "string" ? params.id : undefined;
  const routeTab = parseTabKey(searchParams.get("tab") ?? undefined);
  const showAbout = searchParams.get("dialog") === "about";
  const queryClient = useQueryClient();
  const theme = useTheme();
  const desktopDrawer = useMediaQuery(theme.breakpoints.up("md"), {
    noSsr: true,
  });

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "error",
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const reportSnackbar = useCallback(
    (message: string, severity: "error" | "success"): void => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    [],
  );

  const reportError = useCallback(
    (message: string): void => {
      reportSnackbar(message, "error");
    },
    [reportSnackbar],
  );

  const reportSuccess = useCallback(
    (message: string): void => {
      reportSnackbar(message, "success");
    },
    [reportSnackbar],
  );

  const clearError = useCallback((): void => {
    setSnackbarOpen(false);
    setSnackbarMessage(null);
  }, []);

  const closeSnackbar = useCallback((): void => {
    setSnackbarOpen(false);
  }, []);

  const handleSnackbarExited = useCallback((): void => {
    setSnackbarMessage(null);
  }, []);
  const [showEmails, setShowEmails] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [loginAnswer, setLoginAnswer] = useState("");
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [surveysMenuAnchor, setSurveysMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [pastSurveysMenuAnchor, setPastSurveysMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [saveAttentionActive, setSaveAttentionActive] = useState(false);

  const {
    selectedUser,
    activeTab,
    dirty,
    childIndexes,
    setActiveTab,
    setDirty,
    loadMemberFromRoute,
    openMember,
    startNewMember,
    clearSelection,
    replaceSelectedUser,
    updateField,
    addChild,
    removeChild,
  } = useMemberEditor();

  const selectedUserRef = useRef(selectedUser);
  selectedUserRef.current = selectedUser;

  const sessionQuery = useSessionQuery();
  const authenticated = sessionQuery.data?.authenticated ?? false;
  const sessionLoading =
    sessionQuery.isPending && sessionQuery.data === undefined;
  const membersQuery = useMembersQuery(authenticated);
  const parentsQuery = useParentsQuery(authenticated);
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const saveMemberMutation = useSaveMemberMutation();
  const deleteMemberMutation = useDeleteMemberMutation();
  const {
    openSurvey,
    activeSurveys,
    pastSurveys,
    dialogs: surveyDialogs,
  } = useSurveyLifecycle({
    authenticated,
    onError: reportError,
    onClearError: clearError,
  });

  const membersPayload = membersQuery.data;
  const members = membersPayload?.members ?? EMPTY_MEMBERS;
  const metadata = membersPayload?.metadata ?? null;
  const coldMembersLoading =
    membersQuery.isPending && membersPayload === undefined;
  const fathers = parentsQuery.data?.fathers ?? DEFAULT_PARENT_OPTIONS;
  const mothers = parentsQuery.data?.mothers ?? DEFAULT_PARENT_OPTIONS;
  const parentsLoaded = parentsQuery.data !== undefined;
  const saving = saveMemberMutation.isPending;
  const deleting = deleteMemberMutation.isPending;
  const loginBusy = loginMutation.isPending;
  const saveEnabled = !!selectedUser && dirty && !saving;

  const resetDirty = useCallback((): void => {
    setDirty(false);
  }, [setDirty]);

  const navigation = useFamilyNavigation({
    routeMemberId,
    routeTab,
    members,
    dirty,
    desktopDrawer,
    onLoadRouteMember: loadMemberFromRoute,
    onRouteTabChange: setActiveTab,
    onResetDirty: resetDirty,
  });

  const handleTabChange = useCallback(
    (tab: TabKey): void => {
      setActiveTab(tab);
      if (
        !selectedUser ||
        !routeMemberId ||
        selectedUser.id !== routeMemberId
      ) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams.toString());
      if (tab === "family") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", tab);
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, routeMemberId, router, searchParams, selectedUser, setActiveTab],
  );

  useEffect(() => {
    const queryError =
      sessionQuery.error ?? membersQuery.error ?? parentsQuery.error;
    if (queryError) {
      reportError(queryError.message);
    }
  }, [membersQuery.error, parentsQuery.error, reportError, sessionQuery.error]);

  const nameSignature = displayNameSignature(selectedUser);
  const displayNameOptions = useMemo(() => {
    if (!nameSignature) {
      return EMPTY_DISPLAY_NAME_OPTIONS;
    }
    const member = selectedUserRef.current;
    if (!member) {
      return EMPTY_DISPLAY_NAME_OPTIONS;
    }
    return buildDisplayNameOptions(member).map((option) => option.display);
  }, [nameSignature]);

  const fatherOptions = useMemo(
    () => buildParentSelectOptions(fathers, selectedUser?.father, members),
    [fathers, members, selectedUser?.father],
  );

  const motherOptions = useMemo(
    () => buildParentSelectOptions(mothers, selectedUser?.mother, members),
    [mothers, members, selectedUser?.mother],
  );

  const routeMemberExists = useMemo(
    () =>
      routeMemberId
        ? members.some((member) => member.id === routeMemberId)
        : false,
    [members, routeMemberId],
  );
  const selectedMemberTitle = selectedUser
    ? formatMemberName(selectedUser)
    : "";
  const showMemberTitleSkeleton =
    navigation.showEditor &&
    !!routeMemberId &&
    !selectedMemberTitle &&
    (membersPayload === undefined || routeMemberExists);
  const showEditorLoadingSkeleton =
    navigation.showEditor &&
    !!routeMemberId &&
    !selectedUser &&
    (membersPayload === undefined || routeMemberExists);
  const shouldAnimateSaveAttention =
    navigation.showEditor && !!routeMemberId && saveEnabled;

  useEffect(() => {
    if (!shouldAnimateSaveAttention) {
      setSaveAttentionActive(false);
      return;
    }

    let resetTimer: number | undefined;
    const triggerAttention = (): void => {
      setSaveAttentionActive(true);
      if (resetTimer !== undefined) {
        window.clearTimeout(resetTimer);
      }
      resetTimer = window.setTimeout(() => {
        setSaveAttentionActive(false);
      }, 950);
    };

    const intervalId = window.setInterval(triggerAttention, 10_000);
    return () => {
      window.clearInterval(intervalId);
      if (resetTimer !== undefined) {
        window.clearTimeout(resetTimer);
      }
    };
  }, [shouldAnimateSaveAttention]);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    clearError();

    try {
      await loginMutation.mutateAsync(loginAnswer);
      setLoginAnswer("");
      navigation.resetToBrowse();
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const logout = async (): Promise<void> => {
    clearError();
    try {
      await logoutMutation.mutateAsync();
      clearSelection();
      navigation.resetToBrowse();
      navigation.replaceHomeRoute();
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const saveSelected = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }
    if (!hasRequiredMemberFields(selectedUser)) {
      reportError("First name, last name, and gender are required.");
      return;
    }

    clearError();
    try {
      const saved = await saveMemberMutation.mutateAsync(selectedUser);
      replaceSelectedUser(saved);
      reportSuccess("Member saved.");
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const { showEditorLayout, openMemberEditor } = navigation;

  const beginAddMember = useCallback((): void => {
    startNewMember();
    showEditorLayout();
  }, [showEditorLayout, startNewMember]);

  const addMember = (): void => {
    if (dirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    beginAddMember();
  };

  const deleteSelected = (): void => {
    if (!selectedUser) {
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteSelected = async (): Promise<void> => {
    if (!selectedUser) {
      setConfirmDeleteOpen(false);
      return;
    }

    clearError();
    try {
      await deleteMemberMutation.mutateAsync(selectedUser.id);
      clearSelection();
      navigation.resetToBrowse();
      navigation.replaceHomeRoute();
      reportSuccess("Member deleted.");
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const exportMailingLabels = (): void => {
    window.location.href = "/api/export/mailing";
  };

  const openEmailsDialog = async (): Promise<void> => {
    try {
      const payload = await queryClient.fetchQuery({
        queryKey: familyKeys.emails(),
        queryFn: fetchEmails,
      });
      setEmailsText(payload.emails.join("; "));
      setCopiedEmailText(false);
      setShowEmails(true);
    } catch (caughtError) {
      if (isUnauthorizedError(caughtError)) {
        queryClient.setQueryData(familyKeys.session(), {
          authenticated: false,
        });
        return;
      }
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const copyEmails = async (): Promise<void> => {
    if (!emailsText) {
      return;
    }
    clearError();
    try {
      await navigator.clipboard.writeText(emailsText);
      setCopiedEmailText(true);
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const closeMoreMenu = (): void => {
    setPastSurveysMenuAnchor(null);
    setSurveysMenuAnchor(null);
    setThemeMenuAnchor(null);
    setMoreMenuAnchor(null);
  };

  const openAboutDialog = useCallback((): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("dialog", "about");
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const closeAboutDialog = useCallback((): void => {
    if (!searchParams.has("dialog")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("dialog");
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const handleEditMemberMobile = useCallback(
    (member: FamilyMemberRecord): void => {
      openMemberEditor(member, "mobile", openMember);
    },
    [openMemberEditor, openMember],
  );

  const handleEditMemberDesktop = useCallback(
    (member: FamilyMemberRecord): void => {
      openMemberEditor(member, "desktop", openMember);
    },
    [openMemberEditor, openMember],
  );

  const closeEmailsDialog = useCallback((): void => {
    setShowEmails(false);
  }, []);

  const confirmDiscard = useCallback((): void => {
    setConfirmDiscardOpen(false);
    beginAddMember();
  }, [beginAddMember]);

  const cancelDiscard = useCallback((): void => {
    setConfirmDiscardOpen(false);
  }, []);

  const cancelDelete = useCallback((): void => {
    setConfirmDeleteOpen(false);
  }, []);

  const appSnackbar = (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={snackbarSeverity === "success" ? 4000 : null}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={(_, reason) => {
        if (reason === "clickaway") {
          return;
        }
        closeSnackbar();
      }}
      slotProps={{
        transition: {
          onExited: handleSnackbarExited,
        },
      }}
    >
      <Alert
        severity={snackbarSeverity}
        variant="filled"
        onClose={closeSnackbar}
        sx={{
          width: "100%",
          bgcolor:
            snackbarSeverity === "success" ? "primary.main" : "secondary.main",
          color:
            snackbarSeverity === "success"
              ? "primary.contrastText"
              : "secondary.contrastText",
          "& .MuiAlert-icon": { color: "inherit" },
        }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );

  if (sessionLoading) {
    return (
      <>
        <Box
          sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
        >
          <CircularProgress />
        </Box>
        {appSnackbar}
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <LoginScreen
          loginAnswer={loginAnswer}
          setLoginAnswer={setLoginAnswer}
          loginBusy={loginBusy}
          onSubmit={handleLogin}
        />
        {appSnackbar}
      </>
    );
  }

  return (
    <BrowseSearchProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <FamilyAppBar
          showEditor={navigation.showEditor}
          desktopBrowsing={navigation.desktopBrowsing}
          desktopEditing={navigation.desktopEditing}
          mobileBrowsing={navigation.mobileBrowsing}
          mobileEditing={navigation.mobileEditing}
          showMemberTitleSkeleton={showMemberTitleSkeleton}
          selectedMemberTitle={selectedMemberTitle}
          metadata={metadata}
          members={members}
          coldMembersLoading={coldMembersLoading}
          onBack={navigation.returnToBrowse}
          showAdd={navigation.desktopBrowsing || navigation.mobileBrowsing}
          showAddChild={navigation.showEditor && activeTab === "children"}
          showSave={navigation.showEditor}
          saving={saving}
          saveEnabled={saveEnabled}
          saveAttentionActive={saveAttentionActive}
          onAdd={addMember}
          onAddChild={addChild}
          onSave={saveSelected}
          onOpenMoreMenu={setMoreMenuAnchor}
          moreMenuOpen={Boolean(moreMenuAnchor)}
        />

        <Box
          sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <BrowseShell
            members={members}
            lastUpdatedMemberId={metadata?.lastUpdatedID}
            loading={coldMembersLoading}
            mobileBrowsing={navigation.mobileBrowsing}
            desktopBrowsing={navigation.desktopBrowsing}
            onEditMemberMobile={handleEditMemberMobile}
            onEditMemberDesktop={handleEditMemberDesktop}
          />
          {navigation.showEditor ? (
            <EditorShell
              selectedUser={selectedUser}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              parentsLoaded={parentsLoaded}
              fatherOptions={fatherOptions}
              motherOptions={motherOptions}
              displayNameOptions={displayNameOptions}
              updateField={updateField}
              childIndexes={childIndexes}
              removeChild={removeChild}
              showEditorLoadingSkeleton={showEditorLoadingSkeleton}
              mobileBrowsing={navigation.mobileBrowsing}
            />
          ) : null}
        </Box>

        <AppMenus
          showDeleteAction={navigation.showDeleteAction}
          selectedUser={Boolean(selectedUser)}
          deleting={deleting}
          moreMenuAnchor={moreMenuAnchor}
          themeMenuAnchor={themeMenuAnchor}
          surveysMenuAnchor={surveysMenuAnchor}
          pastSurveysMenuAnchor={pastSurveysMenuAnchor}
          activeSurveys={activeSurveys}
          pastSurveys={pastSurveys}
          closeMoreMenu={closeMoreMenu}
          setThemeMenuAnchor={setThemeMenuAnchor}
          setSurveysMenuAnchor={setSurveysMenuAnchor}
          setPastSurveysMenuAnchor={setPastSurveysMenuAnchor}
          onDeleteSelected={deleteSelected}
          onOpenEmailsDialog={openEmailsDialog}
          onExportMailingLabels={exportMailingLabels}
          onOpenSurvey={openSurvey}
          onOpenAboutDialog={openAboutDialog}
          onLogout={logout}
        />

        {showAbout ? (
          <AboutDialog open={showAbout} onClose={closeAboutDialog} />
        ) : null}
        <ConfirmDialog
          open={confirmDiscardOpen}
          title="Discard unsaved changes?"
          description="You have unsaved changes. Add a new member anyway?"
          confirmLabel="Discard and continue"
          onConfirm={confirmDiscard}
          onCancel={cancelDiscard}
        />
        <ConfirmDialog
          open={confirmDeleteOpen}
          title="Remove family member?"
          description={
            selectedUser
              ? `Remove ${formatMemberName(selectedUser)} from the directory?`
              : "Remove the selected family member?"
          }
          confirmLabel="Remove member"
          confirmColor="error"
          onConfirm={confirmDeleteSelected}
          onCancel={cancelDelete}
        />
        {showEmails ? (
          <EmailsDialog
            open={showEmails}
            onClose={closeEmailsDialog}
            emailsText={emailsText}
            copiedEmailText={copiedEmailText}
            onCopyEmails={copyEmails}
            fullScreen={!desktopDrawer}
          />
        ) : null}
        {surveyDialogs}
      </Box>
      {appSnackbar}
    </BrowseSearchProvider>
  );
}
