import "@testing-library/jest-dom/vitest";
import {
  createElement,
  type ComponentType,
  useEffect,
  useState,
} from "react";
import { vi } from "vitest";

vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  ) => {
    function DynamicTestComponent(props: Record<string, unknown>) {
      const [Resolved, setResolved] = useState<ComponentType<
        Record<string, unknown>
      > | null>(null);

      useEffect(() => {
        let cancelled = false;
        void loader().then((module) => {
          if (!cancelled) {
            setResolved(() => module.default);
          }
        });
        return () => {
          cancelled = true;
        };
      }, []);

      if (!Resolved) {
        return null;
      }

      return createElement(Resolved, props);
    }

    return DynamicTestComponent;
  },
}));
