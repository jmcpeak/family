"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AboutDialog,
  ConfirmDialog,
  EmailsDialog,
} from "@/components/family/app-dialogs";
import { AppMenus } from "@/components/family/app-menus";
import { FamilyAppBar } from "@/components/family/family-app-bar";
import { LoginScreen } from "@/components/family/login-screen";
import {
  EditorLoadingSkeleton,
  MemberEditor,
} from "@/components/family/member-editor";
import {
  SurveyDialog,
  type SurveyCloseOptions,
} from "@/components/family/surveys/survey-dialog";
import { SurveyResultsDialog } from "@/components/family/surveys/survey-results-dialog";
import { MemberBrowser } from "@/components/member-browser";
import { useThemeMode } from "@/components/mui-theme-provider";
import {
  useDeleteMemberMutation,
  useLoginMutation,
  useLogoutMutation,
  useMembersQuery,
  useParentsQuery,
  useSaveMemberMutation,
  useSessionQuery,
  useSubmitSurveyMutation,
  useSurveyResultsQuery,
  useSurveysQuery,
} from "@/hooks/use-family-data";
import { useFamilyNavigation } from "@/hooks/use-family-navigation";
import { useMemberEditor } from "@/hooks/use-member-editor";
import {
  buildParentSelectOptions,
  filterVisibleMembers,
  hasRequiredMemberFields,
  parseTabKey,
  type TabKey,
} from "@/lib/family-editor";
import { buildDisplayNameOptions, formatMemberName } from "@/lib/member-utils";
import { familyKeys } from "@/lib/queries/query-keys";
import {
  dismissSurveyAutoOpen,
  getSurveyPath,
  isSurveyAutoOpenDismissed,
  parseSurveyResultsSlugFromPathname,
  parseSurveySlugFromPathname,
  type SurveySlug,
  type SurveySubmissionPayload,
} from "@/lib/surveys";
import type { FamilyMemberRecord, ParentOption } from "@/lib/types";

const EMPTY_MEMBERS: FamilyMemberRecord[] = [];
const DEFAULT_PARENT_OPTIONS: ParentOption[] = [
  { id: "", firstName: "", lastName: "" },
];

export function FamilyApp(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id?: string; tab?: string | string[] }>();
  const routeMemberId = typeof params.id === "string" ? params.id : undefined;
  const routeTabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const routeTab = parseTabKey(
    typeof routeTabParam === "string" ? routeTabParam : undefined,
  );
  const routeSurveySlug = useMemo(
    () => parseSurveySlugFromPathname(pathname),
    [pathname],
  );
  const routeSurveyResultsSlug = useMemo(
    () => parseSurveyResultsSlugFromPathname(pathname),
    [pathname],
  );
  const queryClient = useQueryClient();
  const theme = useTheme();
  const desktopDrawer = useMediaQuery(theme.breakpoints.up("md"), {
    noSsr: true,
  });
  const {
    mode: themeMode,
    resolvedMode,
    setMode: setThemeMode,
  } = useThemeMode();

  const [error, setError] = useState<string | null>(null);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

  const reportError = useCallback((message: string): void => {
    setError(message);
    setErrorSnackbarOpen(true);
  }, []);

  const clearError = useCallback((): void => {
    setErrorSnackbarOpen(false);
    setError(null);
  }, []);

  const closeErrorSnackbar = useCallback((): void => {
    setErrorSnackbarOpen(false);
  }, []);

  const handleErrorSnackbarExited = useCallback((): void => {
    setError(null);
  }, []);
  const [search, setSearch] = useState("");
  const [showAbout, setShowAbout] = useState(false);
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
  const [surveySubmitError, setSurveySubmitError] = useState<string | null>(
    null,
  );
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [surveyResultsDialogOpen, setSurveyResultsDialogOpen] = useState(false);
  const [saveAttentionActive, setSaveAttentionActive] = useState(false);
  const autoOpenedSurveySlugRef = useRef<SurveySlug | null>(null);

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

  const sessionQuery = useSessionQuery();
  const authenticated = sessionQuery.data?.authenticated ?? false;
  const sessionLoading =
    sessionQuery.isPending && sessionQuery.data === undefined;
  const membersQuery = useMembersQuery(authenticated);
  const parentsQuery = useParentsQuery(authenticated);
  const surveysQuery = useSurveysQuery(authenticated);
  const surveyResultsQuery = useSurveyResultsQuery(
    authenticated,
    routeSurveyResultsSlug,
  );
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const saveMemberMutation = useSaveMemberMutation();
  const deleteMemberMutation = useDeleteMemberMutation();
  const submitSurveyMutation = useSubmitSurveyMutation();

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
  const submittingSurvey = submitSurveyMutation.isPending;
  const saveEnabled = !!selectedUser && dirty && !saving;
  const activeSurveys = surveysQuery.data?.active ?? [];
  const pastSurveys = surveysQuery.data?.past ?? [];
  const selectedSurvey = useMemo(
    () =>
      routeSurveySlug
        ? ([...activeSurveys, ...pastSurveys].find(
            (survey) => survey.slug === routeSurveySlug,
          ) ?? null)
        : null,
    [activeSurveys, pastSurveys, routeSurveySlug],
  );

  const navigation = useFamilyNavigation({
    routeMemberId,
    routeTab,
    members,
    dirty,
    desktopDrawer,
    onLoadRouteMember: loadMemberFromRoute,
    onRouteTabChange: setActiveTab,
    onResetDirty: () => setDirty(false),
  });
  const { pushMemberTabRoute } = navigation;

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
      pushMemberTabRoute(selectedUser.id, tab);
    },
    [pushMemberTabRoute, routeMemberId, selectedUser, setActiveTab],
  );

  useEffect(() => {
    const queryError =
      sessionQuery.error ??
      membersQuery.error ??
      parentsQuery.error ??
      surveysQuery.error ??
      surveyResultsQuery.error;
    if (queryError) {
      reportError(queryError.message);
    }
  }, [
    membersQuery.error,
    parentsQuery.error,
    reportError,
    sessionQuery.error,
    surveyResultsQuery.error,
    surveysQuery.error,
  ]);

  const visibleMembers = useMemo(
    () => filterVisibleMembers(members, search),
    [members, search],
  );

  const displayNameOptions = useMemo(() => {
    if (!selectedUser) {
      return [];
    }
    return buildDisplayNameOptions(selectedUser).map(
      (option) => option.display,
    );
  }, [selectedUser]);

  const fatherOptions = useMemo(
    () => buildParentSelectOptions(fathers, selectedUser?.father, members),
    [fathers, members, selectedUser?.father],
  );

  const motherOptions = useMemo(
    () => buildParentSelectOptions(mothers, selectedUser?.mother, members),
    [mothers, members, selectedUser?.mother],
  );

  const routeMemberExists = routeMemberId
    ? members.some((member) => member.id === routeMemberId)
    : false;
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
    } catch (caughtError) {
      reportError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const beginAddMember = useCallback((): void => {
    startNewMember();
    navigation.showEditorLayout();
  }, [navigation, startNewMember]);

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
      const response = await fetch("/api/emails");
      if (response.status === 401) {
        queryClient.setQueryData(familyKeys.session(), {
          authenticated: false,
        });
        return;
      }
      if (!response.ok) {
        throw new Error("Unable to fetch emails.");
      }

      const payload = (await response.json()) as { emails: string[] };
      setEmailsText(payload.emails.join("; "));
      setCopiedEmailText(false);
      setShowEmails(true);
    } catch (caughtError) {
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

  const openSurvey = useCallback(
    (slug: SurveySlug): void => {
      setSurveySubmitError(null);
      router.push(getSurveyPath(slug));
    },
    [router],
  );

  const closeSurvey = useCallback(
    (options?: SurveyCloseOptions): void => {
      setSurveySubmitError(null);
      if (routeSurveySlug) {
        autoOpenedSurveySlugRef.current = routeSurveySlug;
        if (options?.dontAskAgain) {
          dismissSurveyAutoOpen(routeSurveySlug);
        }
      }
      setSurveyDialogOpen(false);
      if (routeSurveySlug) {
        router.replace("/");
      }
    },
    [routeSurveySlug, router],
  );

  const closeSurveyResults = useCallback((): void => {
    setSurveyResultsDialogOpen(false);
    if (routeSurveyResultsSlug) {
      router.replace("/");
    }
  }, [routeSurveyResultsSlug, router]);

  const submitSelectedSurvey = useCallback(
    async (
      slug: SurveySlug,
      payload: SurveySubmissionPayload,
    ): Promise<void> => {
      clearError();
      setSurveySubmitError(null);
      try {
        await submitSurveyMutation.mutateAsync({ slug, payload });
        await queryClient.invalidateQueries({ queryKey: familyKeys.surveys() });
        router.replace("/");
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "Unknown error";
        setSurveySubmitError(message);
        reportError(message);
      }
    },
    [clearError, queryClient, reportError, router, submitSurveyMutation],
  );

  useEffect(() => {
    if (!authenticated) {
      autoOpenedSurveySlugRef.current = null;
      return;
    }

    if (
      routeSurveySlug ||
      routeSurveyResultsSlug ||
      surveysQuery.isPending ||
      activeSurveys.length === 0
    ) {
      return;
    }

    const nextSurvey = activeSurveys.find((survey) => !survey.completed);
    if (!nextSurvey) {
      return;
    }

    if (isSurveyAutoOpenDismissed(nextSurvey.slug)) {
      autoOpenedSurveySlugRef.current = nextSurvey.slug;
      return;
    }

    if (autoOpenedSurveySlugRef.current === nextSurvey.slug) {
      return;
    }

    autoOpenedSurveySlugRef.current = nextSurvey.slug;
    openSurvey(nextSurvey.slug);
  }, [
    activeSurveys,
    authenticated,
    openSurvey,
    routeSurveyResultsSlug,
    routeSurveySlug,
    surveysQuery.isPending,
  ]);

  useEffect(() => {
    setSurveyDialogOpen(Boolean(routeSurveySlug));
  }, [routeSurveySlug]);

  useEffect(() => {
    setSurveyResultsDialogOpen(Boolean(routeSurveyResultsSlug));
  }, [routeSurveyResultsSlug]);

  useEffect(() => {
    if (routeSurveySlug) {
      autoOpenedSurveySlugRef.current = routeSurveySlug;
    }
  }, [routeSurveySlug]);

  const closeMoreMenu = (): void => {
    setPastSurveysMenuAnchor(null);
    setSurveysMenuAnchor(null);
    setThemeMenuAnchor(null);
    setMoreMenuAnchor(null);
  };

  const errorSnackbar = (
    <Snackbar
      open={errorSnackbarOpen}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={(_, reason) => {
        if (reason === "clickaway") {
          return;
        }
        closeErrorSnackbar();
      }}
      slotProps={{
        transition: {
          onExited: handleErrorSnackbarExited,
        },
      }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={closeErrorSnackbar}
        sx={{ width: "100%" }}
      >
        {error}
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
        {errorSnackbar}
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
        {errorSnackbar}
      </>
    );
  }

  return (
    <>
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
          search={search}
          setSearch={setSearch}
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
          <Box
            component="aside"
            aria-label="Family member list"
            sx={{
              display: {
                xs: navigation.mobileBrowsing ? "flex" : "none",
                md: "none",
              },
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                px: 1.5,
                pt: 1.5,
                pb: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <MemberBrowser
                members={visibleMembers}
                lastUpdatedMemberId={metadata?.lastUpdatedID}
                loading={coldMembersLoading}
                onEditMember={(member) =>
                  navigation.openMemberEditor(member, "mobile", openMember)
                }
              />
            </Box>
          </Box>

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              overflowY: "auto",
              display: {
                xs: navigation.mobileBrowsing ? "none" : "flex",
                md: "flex",
              },
              flexDirection: "column",
              backgroundImage:
                "linear-gradient(135deg, rgba(20, 107, 58, 0.025), transparent 42%, rgba(201, 106, 27, 0.025))",
            }}
          >
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {navigation.desktopBrowsing ? (
                <MemberBrowser
                  members={visibleMembers}
                  lastUpdatedMemberId={metadata?.lastUpdatedID}
                  loading={coldMembersLoading}
                  onEditMember={(member) =>
                    navigation.openMemberEditor(member, "desktop", openMember)
                  }
                />
              ) : (
                <Box>
                  {showEditorLoadingSkeleton ? (
                    <EditorLoadingSkeleton activeTab={activeTab} />
                  ) : null}
                  {!selectedUser && !showEditorLoadingSkeleton ? (
                    <Box color="text.secondary">
                      Select a family member to begin.
                    </Box>
                  ) : null}
                  {selectedUser ? (
                    <MemberEditor
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
                    />
                  ) : null}
                </Box>
              )}
            </Box>
          </Box>
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
          themeMode={themeMode}
          resolvedMode={resolvedMode}
          closeMoreMenu={closeMoreMenu}
          setThemeMenuAnchor={setThemeMenuAnchor}
          setSurveysMenuAnchor={setSurveysMenuAnchor}
          setPastSurveysMenuAnchor={setPastSurveysMenuAnchor}
          onDeleteSelected={deleteSelected}
          onOpenEmailsDialog={openEmailsDialog}
          onExportMailingLabels={exportMailingLabels}
          onOpenSurvey={openSurvey}
          onOpenAboutDialog={() => setShowAbout(true)}
          onLogout={logout}
          onSetThemeMode={setThemeMode}
        />

        <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
        <ConfirmDialog
          open={confirmDiscardOpen}
          title="Discard unsaved changes?"
          description="You have unsaved changes. Add a new member anyway?"
          confirmLabel="Discard and continue"
          onConfirm={() => {
            setConfirmDiscardOpen(false);
            beginAddMember();
          }}
          onCancel={() => setConfirmDiscardOpen(false)}
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
          onCancel={() => setConfirmDeleteOpen(false)}
        />
        <EmailsDialog
          open={showEmails}
          onClose={() => setShowEmails(false)}
          emailsText={emailsText}
          copiedEmailText={copiedEmailText}
          onCopyEmails={copyEmails}
          fullScreen={!desktopDrawer}
        />
        <SurveyDialog
          open={surveyDialogOpen}
          loading={Boolean(routeSurveySlug) && surveysQuery.isPending}
          survey={selectedSurvey}
          submitting={submittingSurvey}
          submitError={surveySubmitError}
          onSubmit={submitSelectedSurvey}
          onClose={closeSurvey}
        />
        <SurveyResultsDialog
          open={surveyResultsDialogOpen}
          loading={
            Boolean(routeSurveyResultsSlug) && surveyResultsQuery.isPending
          }
          surveySlug={routeSurveyResultsSlug}
          results={surveyResultsQuery.data ?? null}
          onClose={closeSurveyResults}
        />
      </Box>
      {errorSnackbar}
    </>
  );
}
