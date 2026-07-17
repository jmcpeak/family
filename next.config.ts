import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const projectRoot = path.resolve(__dirname);

const isProduction = process.env.NODE_ENV === "production";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

function runGitCommand(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function readPackageVersion(): string {
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8"),
    ) as { version?: string };
    return packageJson.version?.trim() || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function resolveCommitSha(): string {
  const amplifyCommit = process.env.AWS_COMMIT_ID?.trim();

  if (amplifyCommit && amplifyCommit !== "HEAD") {
    const resolvedAmplifyCommit = runGitCommand(["rev-parse", amplifyCommit]);
    if (resolvedAmplifyCommit) {
      return resolvedAmplifyCommit;
    }
  }

  return runGitCommand(["rev-parse", "HEAD"]) ?? "local";
}

const appVersion = readPackageVersion();
const gitCommitFull = resolveCommitSha();
const gitCommitShort =
  gitCommitFull === "local" ? "local" : gitCommitFull.slice(0, 7);
const commitCreatedAt =
  gitCommitFull === "local"
    ? null
    : runGitCommand(["show", "-s", "--format=%cI", gitCommitFull]);
const buildCreatedAt = commitCreatedAt ?? new Date().toISOString();

process.env.NEXT_PUBLIC_APP_VERSION = appVersion;
process.env.NEXT_PUBLIC_GIT_COMMIT_FULL = gitCommitFull;
process.env.NEXT_PUBLIC_GIT_COMMIT = gitCommitShort;
process.env.NEXT_PUBLIC_BUILD_DATE = buildCreatedAt;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_COMMIT_FULL: gitCommitFull,
    NEXT_PUBLIC_GIT_COMMIT: gitCommitShort,
    NEXT_PUBLIC_BUILD_DATE: buildCreatedAt,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
