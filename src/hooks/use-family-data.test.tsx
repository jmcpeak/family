import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMembersQuery } from "@/hooks/use-family-data";
import { familyKeys } from "@/lib/queries/query-keys";
import type { FamilyListResponse } from "@/lib/types";

const MEMBERS_PAYLOAD: FamilyListResponse = {
  members: [
    {
      id: "1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
  ],
  metadata: null,
};

function createTestClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function createJsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("useMembersQuery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps cached members visible while refetching", async () => {
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.members(), MEMBERS_PAYLOAD);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(createJsonResponse(200, MEMBERS_PAYLOAD)),
    );

    const { result } = renderHook(() => useMembersQuery(true), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current.data?.members).toHaveLength(1);
    expect(result.current.isPending).toBe(false);
    await waitFor(() => expect(result.current.isFetching).toBe(true));
  });

  it("updates session cache to unauthenticated on 401", async () => {
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.session(), { authenticated: true });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(createJsonResponse(401, { error: "Unauthorized." })),
    );

    const { result } = renderHook(() => useMembersQuery(true), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(queryClient.getQueryData(familyKeys.session())).toEqual({
      authenticated: false,
    });
  });
});
