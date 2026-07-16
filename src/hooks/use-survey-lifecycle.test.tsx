import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { familyKeys } from "@/lib/queries/query-keys";
import {
  dismissSurveyAutoOpen,
  getSurveyPath,
  isSurveyAutoOpenDismissed,
  type SurveySummary,
  type SurveysResponse,
} from "@/lib/surveys";
import { useSurveyLifecycle } from "./use-survey-lifecycle";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
}));

function createSurveySummary(
  overrides: Partial<SurveySummary> = {},
): SurveySummary {
  return {
    slug: "2027-reunion-interest",
    title: "2027 Family Reunion Interest Survey",
    summary: "Help us plan reunion activities.",
    status: "active",
    openedAt: 1000,
    closesAt: 2000,
    path: "/surveys/2027-reunion-interest",
    completed: false,
    ...overrides,
  };
}

function createSurveysResponse(
  overrides: Partial<SurveysResponse> = {},
): SurveysResponse {
  return {
    active: [createSurveySummary()],
    past: [],
    ...overrides,
  };
}

function createTestClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSurveyLifecycle", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockPathname = "/";
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createSurveysResponse(),
      }),
    );
  });

  it("auto-opens the next incomplete active Survey", async () => {
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());
    const onError = vi.fn();
    const onClearError = vi.fn();

    renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError,
          onClearError,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        getSurveyPath("2027-reunion-interest"),
      );
    });
  });

  it("does not auto-open when Survey Lifecycle dismiss is set", async () => {
    dismissSurveyAutoOpen("2027-reunion-interest");
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());

    renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError: vi.fn(),
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("openSurvey navigates to the Survey path", () => {
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());

    const { result } = renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError: vi.fn(),
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    act(() => {
      result.current.openSurvey("2027-reunion-interest");
    });

    expect(mockPush).toHaveBeenCalledWith(
      getSurveyPath("2027-reunion-interest"),
    );
  });

  it("closes with don't-ask-again and dismisses auto-open", async () => {
    mockPathname = "/surveys/2027-reunion-interest";
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());

    const { result } = renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError: vi.fn(),
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    const { getByRole, unmount } = render(result.current.dialogs);

    fireEvent.click(getByRole("checkbox", { name: /don't ask again/i }));
    fireEvent.click(getByRole("button", { name: /^close$/i }));

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(isSurveyAutoOpenDismissed("2027-reunion-interest")).toBe(true);
    unmount();
  });

  it("reports survey query failures via onError", async () => {
    const queryClient = createTestClient();
    const onError = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Surveys unavailable." }),
      }),
    );

    renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError,
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("reports survey results query failures via onError", async () => {
    mockPathname = "/surveys/2027-reunion-interest/results";
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());
    const onError = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/surveys/2027-reunion-interest")) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ error: "Results unavailable." }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createSurveysResponse(),
        };
      }),
    );

    renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError,
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Results unavailable.");
    });
  });

  it("submit success navigates home and clears shell error", async () => {
    mockPathname = "/surveys/2027-reunion-interest";
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());
    const onClearError = vi.fn();
    const onError = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo) => {
        const url = String(input);
        if (
          url.includes("/api/surveys/2027-reunion-interest") &&
          !url.endsWith("/api/surveys")
        ) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              submitted: true,
              slug: "2027-reunion-interest",
              submittedAt: 1,
              closesAt: 2,
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createSurveysResponse(),
        };
      }),
    );

    const { result } = renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError,
          onClearError,
        }),
      { wrapper: createWrapper(queryClient) },
    );

    const { getByLabelText, getByRole, unmount } = render(
      result.current.dialogs,
    );

    fireEvent.change(getByLabelText(/your name/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.click(getByRole("button", { name: /submit survey/i }));

    await waitFor(() => {
      expect(onClearError).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
    expect(onError).not.toHaveBeenCalled();
    unmount();
  });

  it("submit failure reports via onError", async () => {
    mockPathname = "/surveys/2027-reunion-interest";
    const queryClient = createTestClient();
    queryClient.setQueryData(familyKeys.surveys(), createSurveysResponse());
    const onError = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/surveys/2027-reunion-interest")) {
          return {
            ok: false,
            status: 400,
            json: async () => ({ error: "Already submitted." }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createSurveysResponse(),
        };
      }),
    );

    const { result } = renderHook(
      () =>
        useSurveyLifecycle({
          authenticated: true,
          onError,
          onClearError: vi.fn(),
        }),
      { wrapper: createWrapper(queryClient) },
    );

    const { getByLabelText, getByRole, unmount } = render(
      result.current.dialogs,
    );

    fireEvent.change(getByLabelText(/your name/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.click(getByRole("button", { name: /submit survey/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Already submitted.");
    });
    unmount();
  });
});
