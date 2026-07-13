"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GENDERS, STATES } from "@/lib/constants";
import {
  buildDisplayNameOptions,
  cleanMemberRecord,
  countFamilyMembers,
  createGuid,
  formatDurationYears,
  formatLocation,
  formatMemberName,
  getChildrenIndexes,
  getGoogleMapsUrl,
  getStreetViewUrl,
  hasValidAddress,
  sortMembers,
} from "@/lib/member-utils";
import type {
  FamilyListResponse,
  FamilyMemberRecord,
  LastUpdateMetadata,
  ParentOption,
} from "@/lib/types";

type TabKey = "family" | "address" | "spouse" | "dates" | "children";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "family", label: "family member" },
  { key: "address", label: "address" },
  { key: "spouse", label: "spouse" },
  { key: "dates", label: "dates / places" },
  { key: "children", label: "children / pets" },
];

const DRAWER_WIDTH = 330;

const CHILD_FIELDS = [
  "firstNameChild",
  "middleNameChild",
  "lastNameChild",
  "bithdayChild",
  "genderChild",
] as const;

function copyMember(member: FamilyMemberRecord): FamilyMemberRecord {
  return {
    ...member,
    children: member.children ? [...member.children] : [0],
  };
}

function newMember(): FamilyMemberRecord {
  return {
    id: createGuid(),
    children: [0],
    gender: "",
    genderSpouse: "",
  };
}

function EarliestDateValue(a?: string, b?: string): string | undefined {
  if (!a && !b) {
    return undefined;
  }
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }

  const dateA = new Date(a);
  const dateB = new Date(b);
  if (Number.isNaN(dateA.getTime())) {
    return b;
  }
  if (Number.isNaN(dateB.getTime())) {
    return a;
  }
  return dateA <= dateB ? a : b;
}

interface FieldInputProps {
  label: string;
  value?: string | number;
  type?: string;
  onChange: (value: string) => void;
}

function FieldInput({
  label,
  value,
  type = "text",
  onChange,
}: FieldInputProps): React.JSX.Element {
  return (
    <TextField
      label={label}
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
    />
  );
}

interface FieldTextAreaProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

function FieldTextArea({
  label,
  value,
  onChange,
}: FieldTextAreaProps): React.JSX.Element {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      multiline
      rows={4}
      fullWidth
      size="small"
      sx={{ gridColumn: "1 / -1" }}
    />
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface FieldSelectProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: FieldSelectProps): React.JSX.Element {
  const normalizedValue = value ?? "";
  const safeValue = options.some((option) => option.value === normalizedValue)
    ? normalizedValue
    : "";

  return (
    <TextField
      select
      label={label}
      value={safeValue}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
    >
      {options.map((option) => (
        <MenuItem key={option.value || "__empty"} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function TabGrid({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
        gap: 2,
        mt: 1,
      }}
    >
      {children}
    </Box>
  );
}

function DurationText({
  children,
}: {
  children: string;
}): React.JSX.Element | null {
  if (!children) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontStyle: "italic", alignSelf: "end" }}
    >
      {children}
    </Typography>
  );
}

export function FamilyApp(): React.JSX.Element {
  const theme = useTheme();
  const desktopDrawer = useMediaQuery(theme.breakpoints.up("md"), {
    noSsr: true,
  });
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  const [metadata, setMetadata] = useState<LastUpdateMetadata | null>(null);
  const [selectedUser, setSelectedUser] = useState<FamilyMemberRecord | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("family");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [fathers, setFathers] = useState<ParentOption[]>([]);
  const [mothers, setMothers] = useState<ParentOption[]>([]);
  const [parentsLoaded, setParentsLoaded] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [loginAnswer, setLoginAnswer] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const selectedUserId = selectedUser?.id;

  const loadParents = useCallback(async (): Promise<void> => {
    const [fatherResponse, motherResponse] = await Promise.all([
      fetch("/api/parents?gender=m"),
      fetch("/api/parents?gender=f"),
    ]);

    if (fatherResponse.status === 401 || motherResponse.status === 401) {
      setAuthenticated(false);
      return;
    }

    if (!fatherResponse.ok || !motherResponse.ok) {
      throw new Error("Unable to load parent options.");
    }

    const [fatherData, motherData] = await Promise.all([
      fatherResponse.json() as Promise<ParentOption[]>,
      motherResponse.json() as Promise<ParentOption[]>,
    ]);

    setFathers([{ id: "", firstName: "", lastName: "" }, ...fatherData]);
    setMothers([{ id: "", firstName: "", lastName: "" }, ...motherData]);
    setParentsLoaded(true);
  }, []);

  const loadMembers = useCallback(
    async (preferredSelectionId?: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/members");
        if (response.status === 401) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load family members.");
        }

        const payload = (await response.json()) as FamilyListResponse;
        const sorted = sortMembers(payload.members);
        setMembers(sorted);
        setMetadata(payload.metadata ?? null);

        const nextId = preferredSelectionId ?? selectedUserId;
        const nextSelected =
          (nextId && sorted.find((member) => member.id === nextId)) ||
          sorted[0] ||
          null;
        setSelectedUser(nextSelected ? copyMember(nextSelected) : null);
        setDirty(false);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Unknown error",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedUserId],
  );

  const bootstrap = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        throw new Error("Unable to initialize session.");
      }

      const payload = (await sessionResponse.json()) as {
        authenticated: boolean;
      };
      setAuthenticated(payload.authenticated);
      if (payload.authenticated) {
        await loadParents();
        await loadMembers();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [loadMembers, loadParents]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = sortMembers(members);
    if (!query) {
      return sorted;
    }

    return sorted.filter((member) => {
      const haystack = [
        member.displayName,
        member.firstName,
        member.lastName,
        member.email,
        member.address,
        member.city,
        member.theState,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [members, search]);

  const displayNameOptions = useMemo(() => {
    if (!selectedUser) {
      return [];
    }
    return buildDisplayNameOptions(selectedUser);
  }, [selectedUser]);

  const buildParentSelectOptions = useCallback(
    (
      parents: ParentOption[],
      selectedParentId?: string | number,
    ): SelectOption[] => {
      const options = parents.map((parent) => ({
        value: parent.id,
        label: `${parent.firstName ?? ""} ${parent.lastName ?? ""}`.trim(),
      }));

      const normalizedParentId = String(selectedParentId ?? "");
      if (
        normalizedParentId &&
        !options.some((option) => option.value === normalizedParentId)
      ) {
        const member = members.find((entry) => entry.id === normalizedParentId);
        if (member) {
          options.push({
            value: normalizedParentId,
            label: formatMemberName(member),
          });
        }
      }

      return options;
    },
    [members],
  );

  const fatherOptions = useMemo(
    () => buildParentSelectOptions(fathers, selectedUser?.father),
    [buildParentSelectOptions, fathers, selectedUser?.father],
  );

  const motherOptions = useMemo(
    () => buildParentSelectOptions(mothers, selectedUser?.mother),
    [buildParentSelectOptions, mothers, selectedUser?.mother],
  );

  const updateField = (field: string, value: string): void => {
    setSelectedUser((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        [field]: value,
      };
    });
    setDirty(true);
  };

  const selectUser = (member: FamilyMemberRecord): void => {
    if (dirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    setSelectedUser(copyMember(member));
    setActiveTab("family");
    setDirty(false);
    setAddMode(false);
    if (!desktopDrawer) {
      setDrawerOpen(false);
    }
  };

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLoginError(null);
    setLoginBusy(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ answer: loginAnswer }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to login.");
      }

      setAuthenticated(true);
      setDrawerOpen(true);
      setLoginAnswer("");
      await loadParents();
      await loadMembers();
    } catch (caughtError) {
      setLoginError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setMembers([]);
    setSelectedUser(null);
    setDirty(false);
    setAddMode(false);
    setParentsLoaded(false);
    setDrawerOpen(true);
  };

  const saveSelected = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }

    if (
      !selectedUser.firstName ||
      !selectedUser.lastName ||
      !selectedUser.gender
    ) {
      setError("First name, last name, and gender are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/members/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(cleanMemberRecord(selectedUser)),
      });

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to save member.");
      }

      setAddMode(false);
      await Promise.all([loadMembers(selectedUser.id), loadParents()]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    } finally {
      setSaving(false);
    }
  };

  const addMember = (): void => {
    if (
      dirty &&
      !window.confirm("Discard unsaved changes and add a new member?")
    ) {
      return;
    }

    setSelectedUser(newMember());
    setAddMode(true);
    setActiveTab("family");
    setDirty(false);
  };

  const deleteSelected = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }

    const message = `Remove ${formatMemberName(selectedUser)}?`;
    if (!window.confirm(message)) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/members/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to delete member.");
      }

      await Promise.all([loadMembers(), loadParents()]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = (): void => {
    window.location.href = "/api/export";
  };

  const openEmailsDialog = async (): Promise<void> => {
    try {
      const response = await fetch("/api/emails");
      if (response.status === 401) {
        setAuthenticated(false);
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
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown error",
      );
    }
  };

  const copyEmails = async (): Promise<void> => {
    if (!emailsText) {
      return;
    }

    await navigator.clipboard.writeText(emailsText);
    setCopiedEmailText(true);
  };

  const childIndexes = selectedUser ? getChildrenIndexes(selectedUser) : [];

  const addChild = (): void => {
    if (!selectedUser) {
      return;
    }

    const indices = getChildrenIndexes(selectedUser);
    const next = [...indices, Math.max(...indices) + 1];
    setSelectedUser({
      ...selectedUser,
      children: next,
    });
    setDirty(true);
  };

  const removeChild = (index: number): void => {
    if (!selectedUser) {
      return;
    }

    const nextUser: FamilyMemberRecord = {
      ...selectedUser,
      children: getChildrenIndexes(selectedUser).filter(
        (value) => value !== index,
      ),
    };

    if (!nextUser.children || nextUser.children.length === 0) {
      nextUser.children = [0];
    }

    for (const fieldPrefix of CHILD_FIELDS) {
      delete nextUser[`${fieldPrefix}${index}`];
    }

    setSelectedUser(nextUser);
    setDirty(true);
  };

  if (authenticated === null) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (authenticated === false) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          p: 2,
        }}
      >
        <Paper sx={{ p: 3, width: "min(500px, 100%)" }}>
          <Typography variant="h4" gutterBottom>
            McPeak Family
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            What city is the Family Reunion usually held in?
          </Typography>
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              value={loginAnswer}
              onChange={(event) => setLoginAnswer(event.target.value)}
              disabled={loginBusy}
              autoFocus
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loginBusy}
              fullWidth
            >
              {loginBusy ? "Checking..." : "Login"}
            </Button>
          </Box>
          {loginError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {loginError}
            </Alert>
          ) : null}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen
            ? { xs: `min(88vw, ${DRAWER_WIDTH}px)`, md: DRAWER_WIDTH }
            : 0,
          flexShrink: 0,
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: drawerOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          "& .MuiDrawer-paper": {
            width: { xs: `min(88vw, ${DRAWER_WIDTH}px)`, md: DRAWER_WIDTH },
            boxSizing: "border-box",
            bgcolor: "background.paper",
            p: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography variant="h5">McPeak Family</Typography>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              aria-label="Close family member list"
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Last Update:{" "}
            {metadata?.lastUpdated
              ? new Date(metadata.lastUpdated).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {countFamilyMembers(members)} family members
          </Typography>
          <TextField
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            pr: 0.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {loading ? <CircularProgress size={24} /> : null}
          {visibleMembers.map((member) => (
            <Card
              key={member.id}
              variant="outlined"
              sx={{
                flexShrink: 0,
                borderColor:
                  selectedUser?.id === member.id ? "primary.main" : "divider",
                bgcolor:
                  selectedUser?.id === member.id
                    ? "action.selected"
                    : "background.paper",
              }}
            >
              <CardActionArea onClick={() => selectUser(member)}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {metadata?.lastUpdatedID === member.id ? (
                    <Chip
                      label="Last Updated"
                      size="small"
                      color="success"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  ) : null}
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatMemberName(member)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatLocation(member)}
                  </Typography>
                  {member.email ? (
                    <Typography variant="body2" color="primary">
                      {member.email}
                    </Typography>
                  ) : null}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100dvh",
          overflowY: "auto",
          p: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {!desktopDrawer || !drawerOpen ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minHeight: 48,
            }}
          >
            {!drawerOpen ? (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open family member list"
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Typography variant="h6" noWrap>
              {!desktopDrawer && selectedUser
                ? formatMemberName(selectedUser)
                : "McPeak Family"}
            </Typography>
          </Box>
        ) : null}

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{
            flexWrap: { xs: "nowrap", md: "wrap" },
            flexShrink: 0,
            overflowX: { xs: "auto", md: "visible" },
            pb: { xs: 0.5, md: 0 },
            "& > *": { flexShrink: 0 },
          }}
        >
          <Button
            startIcon={<PersonAddIcon />}
            onClick={addMember}
            variant="outlined"
          >
            Add
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={saveSelected}
            disabled={!selectedUser || saving}
            variant="contained"
          >
            {saving ? "Saving..." : addMode ? "Add member" : "Save"}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={deleteSelected}
            disabled={!selectedUser || deleting}
            color="error"
            variant="outlined"
          >
            {deleting ? "Removing..." : "Delete"}
          </Button>
          <Button
            startIcon={<EmailIcon />}
            onClick={openEmailsDialog}
            variant="outlined"
          >
            E-mail
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={exportCsv}
            variant="outlined"
          >
            Export
          </Button>
          <Button
            startIcon={<InfoIcon />}
            onClick={() => setShowAbout(true)}
            variant="outlined"
          >
            About
          </Button>
          <Button startIcon={<LogoutIcon />} onClick={logout} variant="text">
            Logout
          </Button>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ flexShrink: 0 }}>
            {error}
          </Alert>
        ) : null}

        <Box>
          {!selectedUser ? (
            <Typography color="text.secondary">
              Select a family member to begin.
            </Typography>
          ) : null}

          {selectedUser ? (
            <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Tabs
                value={activeTab}
                onChange={(_, value: TabKey) => setActiveTab(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {TABS.map((tab) => (
                  <Tab key={tab.key} value={tab.key} label={tab.label} />
                ))}
              </Tabs>
              <Divider sx={{ mb: 2 }} />
              {activeTab === "family" ? (
                <TabGrid>
                  <FieldSelect
                    label="Father"
                    value={
                      parentsLoaded ? String(selectedUser.father ?? "") : ""
                    }
                    onChange={(value) => updateField("father", value)}
                    options={fatherOptions}
                  />
                  <FieldInput
                    label="First Name"
                    value={String(selectedUser.firstName ?? "")}
                    onChange={(value) => updateField("firstName", value)}
                  />
                  <FieldInput
                    label="Middle Name"
                    value={String(selectedUser.middleName ?? "")}
                    onChange={(value) => updateField("middleName", value)}
                  />
                  <FieldInput
                    label="Title (Dr.)"
                    value={String(selectedUser.titleName ?? "")}
                    onChange={(value) => updateField("titleName", value)}
                  />
                  <FieldTextArea
                    label="Occupation and/or Hobbies"
                    value={String(selectedUser.hobbies ?? "")}
                    onChange={(value) => updateField("hobbies", value)}
                  />
                  <FieldSelect
                    label="Mother"
                    value={
                      parentsLoaded ? String(selectedUser.mother ?? "") : ""
                    }
                    onChange={(value) => updateField("mother", value)}
                    options={motherOptions}
                  />
                  <FieldInput
                    label="Last Name"
                    value={String(selectedUser.lastName ?? "")}
                    onChange={(value) => updateField("lastName", value)}
                  />
                  <FieldInput
                    label="Maiden Name"
                    value={String(selectedUser.maidenName ?? "")}
                    onChange={(value) => updateField("maidenName", value)}
                  />
                  <FieldInput
                    label="Suffix (Jr.)"
                    value={String(selectedUser.suffixName ?? "")}
                    onChange={(value) => updateField("suffixName", value)}
                  />
                  <FieldSelect
                    label="Gender"
                    value={String(selectedUser.gender ?? "")}
                    onChange={(value) => updateField("gender", value)}
                    options={GENDERS.map((gender) => ({
                      value: gender.key,
                      label: gender.name,
                    }))}
                  />
                  <FieldInput
                    label="Nickname"
                    value={String(selectedUser.nickName ?? "")}
                    onChange={(value) => updateField("nickName", value)}
                  />
                  <FieldSelect
                    label="How should the name appear?"
                    value={String(selectedUser.displayName ?? "")}
                    onChange={(value) => updateField("displayName", value)}
                    options={[
                      { value: "", label: "" },
                      ...displayNameOptions.map((option) => ({
                        value: option.display,
                        label: option.display,
                      })),
                    ]}
                  />
                </TabGrid>
              ) : null}

              {activeTab === "address" ? (
                <TabGrid>
                  <FieldInput
                    label="E-mail"
                    type="email"
                    value={String(selectedUser.email ?? "")}
                    onChange={(value) => updateField("email", value)}
                  />
                  <FieldInput
                    label="Phone"
                    type="tel"
                    value={String(selectedUser.phone ?? "")}
                    onChange={(value) => updateField("phone", value)}
                  />
                  <FieldInput
                    label="Address"
                    value={String(selectedUser.address ?? "")}
                    onChange={(value) => updateField("address", value)}
                  />
                  <FieldInput
                    label="Address Line 2"
                    value={String(selectedUser.address2 ?? "")}
                    onChange={(value) => updateField("address2", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.city ?? "")}
                    onChange={(value) => updateField("city", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.theState ?? "")}
                    onChange={(value) => updateField("theState", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <FieldInput
                    label="Zipcode"
                    value={String(selectedUser.zipcode ?? "")}
                    onChange={(value) => updateField("zipcode", value)}
                  />
                  <FieldInput
                    label="Country"
                    value={String(selectedUser.country ?? "")}
                    onChange={(value) => updateField("country", value)}
                  />
                  {hasValidAddress(selectedUser) ? (
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <Link
                        href={getGoogleMapsUrl(selectedUser)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Google Maps
                      </Link>
                      <Box sx={{ mt: 1 }}>
                        <Image
                          src={getStreetViewUrl(selectedUser)}
                          alt="Street view preview"
                          width={450}
                          height={250}
                          unoptimized
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </Box>
                    </Box>
                  ) : null}
                </TabGrid>
              ) : null}

              {activeTab === "spouse" ? (
                <TabGrid>
                  <FieldInput
                    label="First Name"
                    value={String(selectedUser.firstNameSpouse ?? "")}
                    onChange={(value) => updateField("firstNameSpouse", value)}
                  />
                  <FieldInput
                    label="Last Name"
                    value={String(selectedUser.lastNameSpouse ?? "")}
                    onChange={(value) => updateField("lastNameSpouse", value)}
                  />
                  <FieldSelect
                    label="Gender"
                    value={String(selectedUser.genderSpouse ?? "")}
                    onChange={(value) => updateField("genderSpouse", value)}
                    options={GENDERS.map((gender) => ({
                      value: gender.key,
                      label: gender.name,
                    }))}
                  />
                  <FieldInput
                    label="Middle Name"
                    value={String(selectedUser.middleNameSpouse ?? "")}
                    onChange={(value) => updateField("middleNameSpouse", value)}
                  />
                  <FieldInput
                    label="Maiden Name"
                    value={String(selectedUser.maidenNameSpouse ?? "")}
                    onChange={(value) => updateField("maidenNameSpouse", value)}
                  />
                  <FieldInput
                    label="Nickname"
                    value={String(selectedUser.nickNameSpouse ?? "")}
                    onChange={(value) => updateField("nickNameSpouse", value)}
                  />
                  <FieldInput
                    label="Title (Dr.)"
                    value={String(selectedUser.titleNameSpouse ?? "")}
                    onChange={(value) => updateField("titleNameSpouse", value)}
                  />
                  <FieldInput
                    label="Suffix (Jr.)"
                    value={String(selectedUser.suffixNameSpouse ?? "")}
                    onChange={(value) => updateField("suffixNameSpouse", value)}
                  />
                  <FieldTextArea
                    label="Occupation and/or Hobbies"
                    value={String(selectedUser.hobbiesSpouse ?? "")}
                    onChange={(value) => updateField("hobbiesSpouse", value)}
                  />
                </TabGrid>
              ) : null}

              {activeTab === "dates" ? (
                <TabGrid>
                  <FieldInput
                    label="Birthday"
                    value={String(selectedUser.birthday ?? "")}
                    onChange={(value) => updateField("birthday", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.cityBirth ?? "")}
                    onChange={(value) => updateField("cityBirth", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.stateBirth ?? "")}
                    onChange={(value) => updateField("stateBirth", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <DurationText>
                    {formatDurationYears(
                      String(selectedUser.birthday ?? ""),
                      String(selectedUser.death ?? ""),
                      undefined,
                      "old",
                    )}
                  </DurationText>

                  <FieldInput
                    label="Wedding"
                    value={String(selectedUser.wedding ?? "")}
                    onChange={(value) => updateField("wedding", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.cityWedding ?? "")}
                    onChange={(value) => updateField("cityWedding", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.stateWedding ?? "")}
                    onChange={(value) => updateField("stateWedding", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <DurationText>
                    {formatDurationYears(
                      String(selectedUser.wedding ?? ""),
                      EarliestDateValue(
                        String(selectedUser.death ?? ""),
                        String(selectedUser.deathSpouse ?? ""),
                      ),
                      "Married for",
                    )}
                  </DurationText>

                  <FieldInput
                    label="Death"
                    value={String(selectedUser.death ?? "")}
                    onChange={(value) => updateField("death", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.cityDeath ?? "")}
                    onChange={(value) => updateField("cityDeath", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.stateDeath ?? "")}
                    onChange={(value) => updateField("stateDeath", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <DurationText>
                    {formatDurationYears(
                      String(selectedUser.death ?? ""),
                      undefined,
                      "Passed away",
                      "ago",
                    )}
                  </DurationText>

                  <FieldInput
                    label="Birthday Spouse"
                    value={String(selectedUser.bithdaySpouse ?? "")}
                    onChange={(value) => updateField("bithdaySpouse", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.cityBirthSpouse ?? "")}
                    onChange={(value) => updateField("cityBirthSpouse", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.stateBirthSpouse ?? "")}
                    onChange={(value) => updateField("stateBirthSpouse", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <DurationText>
                    {formatDurationYears(
                      String(selectedUser.bithdaySpouse ?? ""),
                      String(selectedUser.deathSpouse ?? ""),
                      undefined,
                      "old",
                    )}
                  </DurationText>

                  <FieldInput
                    label="Death Spouse"
                    value={String(selectedUser.deathSpouse ?? "")}
                    onChange={(value) => updateField("deathSpouse", value)}
                  />
                  <FieldInput
                    label="City"
                    value={String(selectedUser.cityDeathSpouse ?? "")}
                    onChange={(value) => updateField("cityDeathSpouse", value)}
                  />
                  <FieldSelect
                    label="State"
                    value={String(selectedUser.stateDeathSpouse ?? "")}
                    onChange={(value) => updateField("stateDeathSpouse", value)}
                    options={STATES.map((state) => ({
                      value: state.abbreviation,
                      label: state.name,
                    }))}
                  />
                  <DurationText>
                    {formatDurationYears(
                      String(selectedUser.deathSpouse ?? ""),
                      undefined,
                      "Passed away",
                      "ago",
                    )}
                  </DurationText>
                </TabGrid>
              ) : null}

              {activeTab === "children" ? (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    This is for children still living at home. If they have an
                    address, they should have their own entry.
                  </Typography>

                  {childIndexes.map((childIndex) => (
                    <Paper
                      key={childIndex}
                      variant="outlined"
                      sx={{ p: { xs: 1.5, sm: 2 } }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Child #{childIndex + 1}
                      </Typography>
                      <TabGrid>
                        <FieldInput
                          label="First Name"
                          value={String(
                            selectedUser[`firstNameChild${childIndex}`] ?? "",
                          )}
                          onChange={(value) =>
                            updateField(`firstNameChild${childIndex}`, value)
                          }
                        />
                        <FieldInput
                          label="Middle Name"
                          value={String(
                            selectedUser[`middleNameChild${childIndex}`] ?? "",
                          )}
                          onChange={(value) =>
                            updateField(`middleNameChild${childIndex}`, value)
                          }
                        />
                        <FieldInput
                          label="Last Name"
                          value={String(
                            selectedUser[`lastNameChild${childIndex}`] ?? "",
                          )}
                          onChange={(value) =>
                            updateField(`lastNameChild${childIndex}`, value)
                          }
                        />
                        <FieldInput
                          label="Birthday"
                          value={String(
                            selectedUser[`bithdayChild${childIndex}`] ?? "",
                          )}
                          onChange={(value) =>
                            updateField(`bithdayChild${childIndex}`, value)
                          }
                        />
                        <FieldSelect
                          label="Gender"
                          value={String(
                            selectedUser[`genderChild${childIndex}`] ?? "",
                          )}
                          onChange={(value) =>
                            updateField(`genderChild${childIndex}`, value)
                          }
                          options={GENDERS.map((gender) => ({
                            value: gender.key,
                            label: gender.name,
                          }))}
                        />
                        <DurationText>
                          {formatDurationYears(
                            String(
                              selectedUser[`bithdayChild${childIndex}`] ?? "",
                            ),
                            undefined,
                            undefined,
                            "old",
                          )}
                        </DurationText>
                      </TabGrid>
                      <Button
                        startIcon={<RemoveCircleIcon />}
                        onClick={() => removeChild(childIndex)}
                        disabled={childIndexes.length === 1 && childIndex === 0}
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Remove child row
                      </Button>
                    </Paper>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={addChild}
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Add child row
                  </Button>

                  <FieldTextArea
                    label="Pets"
                    value={String(selectedUser.pets ?? "")}
                    onChange={(value) => updateField("pets", value)}
                  />
                </Stack>
              ) : null}
            </Paper>
          ) : null}
        </Box>
      </Box>

      <Dialog
        open={showAbout}
        onClose={() => setShowAbout(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={!desktopDrawer}
      >
        <DialogTitle>McPeak Family</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>version 3.0</Typography>
          <Link href="mailto:jason.mcpeak@gmail.com">
            jason.mcpeak@gmail.com
          </Link>
          <Box sx={{ mt: 1 }}>
            <Link
              href="https://github.com/jmcpeak/family/issues"
              target="_blank"
              rel="noreferrer"
            >
              Report Issue
            </Link>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAbout(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showEmails}
        onClose={() => setShowEmails(false)}
        maxWidth="md"
        fullWidth
        fullScreen={!desktopDrawer}
      >
        <DialogTitle>Bulk Email Addresses</DialogTitle>
        <DialogContent>
          <TextField value={emailsText} multiline rows={8} fullWidth />
          {copiedEmailText ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              Copied to clipboard.
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={copyEmails} variant="contained">
            Copy and close
          </Button>
          <Button onClick={() => setShowEmails(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
