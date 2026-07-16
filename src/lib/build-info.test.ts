import { describe, expect, it } from "vitest";
import { formatBuildDate, formatBuildId, getBuildInfo } from "@/lib/build-info";

describe("build info helpers", () => {
  it("formats build ids with version and commit", () => {
    expect(formatBuildId("4.0.0", "f48ba7d")).toBe("4.0.0+f48ba7d");
  });

  it("returns safe defaults when env values are missing", () => {
    const info = getBuildInfo({});

    expect(info.version).toBe("0.0.0");
    expect(info.shortCommit).toBe("local");
    expect(info.fullCommit).toBe("local");
    expect(info.buildId).toBe("0.0.0+local");
    expect(info.createdAtIso).toBeNull();
    expect(info.createdAtLabel).toBe("Unknown");
  });

  it("builds metadata from NEXT_PUBLIC values", () => {
    const info = getBuildInfo({
      NEXT_PUBLIC_APP_VERSION: "4.0.0",
      NEXT_PUBLIC_GIT_COMMIT: "f48ba7d",
      NEXT_PUBLIC_GIT_COMMIT_FULL: "f48ba7d2afa6cf0bc74ad3843beb34e1e0545249",
      NEXT_PUBLIC_BUILD_DATE: "2026-07-16T12:00:00.000Z",
    });

    expect(info.buildId).toBe("4.0.0+f48ba7d");
    expect(info.fullCommit).toBe("f48ba7d2afa6cf0bc74ad3843beb34e1e0545249");
    expect(info.createdAtIso).toBe("2026-07-16T12:00:00.000Z");
    expect(info.createdAtLabel).toContain("2026");
  });

  it("returns Unknown for invalid dates", () => {
    expect(formatBuildDate("not-a-date")).toBe("Unknown");
  });
});
