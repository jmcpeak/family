import { describe, expect, it, vi } from "vitest";
import { handleApiError } from "@/lib/api-observability";
import {
  InvalidMemberRecordError,
  MemberNotFoundError,
} from "@/lib/data/repository";

describe("handleApiError", () => {
  it("maps known member errors to safe responses", async () => {
    const notFound = handleApiError(
      { route: "/api/members/[id]", method: "DELETE" },
      new MemberNotFoundError("missing-id"),
    );
    expect(notFound.status).toBe(404);
    await expect(notFound.json()).resolves.toEqual({
      error: "Member not found.",
    });

    const invalid = handleApiError(
      { route: "/api/members/[id]", method: "PUT" },
      new InvalidMemberRecordError("bad payload"),
    );
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({ error: "bad payload" });
  });

  it("maps unknown errors to generic 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = handleApiError(
      { route: "/api/members", method: "GET" },
      new Error("db blew up"),
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unexpected server error.",
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
