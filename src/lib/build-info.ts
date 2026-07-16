const DEFAULT_VERSION = "0.0.0";
const DEFAULT_COMMIT = "local";
const UNKNOWN_DATE = "Unknown";

export interface BuildInfo {
  version: string;
  shortCommit: string;
  fullCommit: string;
  buildId: string;
  createdAtIso: string | null;
  createdAtLabel: string;
}

export interface BuildInfoEnv {
  NEXT_PUBLIC_APP_VERSION?: string;
  NEXT_PUBLIC_GIT_COMMIT?: string;
  NEXT_PUBLIC_GIT_COMMIT_FULL?: string;
  NEXT_PUBLIC_BUILD_DATE?: string;
}

function cleanValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function formatBuildId(version: string, shortSha: string): string {
  const safeVersion = version.trim() || DEFAULT_VERSION;
  const safeShortSha = shortSha.trim() || DEFAULT_COMMIT;
  return `${safeVersion}+${safeShortSha}`;
}

export function formatBuildDate(isoDate: string | null): string {
  if (!isoDate) {
    return UNKNOWN_DATE;
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return UNKNOWN_DATE;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getBuildInfo(env: BuildInfoEnv): BuildInfo {
  const version = cleanValue(env.NEXT_PUBLIC_APP_VERSION) ?? DEFAULT_VERSION;
  const fullCommit =
    cleanValue(env.NEXT_PUBLIC_GIT_COMMIT_FULL) ??
    cleanValue(env.NEXT_PUBLIC_GIT_COMMIT) ??
    DEFAULT_COMMIT;
  const shortCommit = (
    cleanValue(env.NEXT_PUBLIC_GIT_COMMIT) ?? fullCommit
  ).slice(0, 7);
  const createdAtIso = cleanValue(env.NEXT_PUBLIC_BUILD_DATE);

  return {
    version,
    shortCommit,
    fullCommit,
    buildId: formatBuildId(version, shortCommit),
    createdAtIso,
    createdAtLabel: formatBuildDate(createdAtIso),
  };
}

// Keep direct NEXT_PUBLIC access here so Next can inline values in client bundles.
export const buildInfo = getBuildInfo({
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_GIT_COMMIT: process.env.NEXT_PUBLIC_GIT_COMMIT,
  NEXT_PUBLIC_GIT_COMMIT_FULL: process.env.NEXT_PUBLIC_GIT_COMMIT_FULL,
  NEXT_PUBLIC_BUILD_DATE: process.env.NEXT_PUBLIC_BUILD_DATE,
});
