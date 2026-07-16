---
name: no-biome-ignore-deps
description: >-
  Never suppress the biome useExhaustiveDependencies lint rule. Use when writing
  or editing React hooks, effects, callbacks, or any code that triggers biome
  lint/correctness/useExhaustiveDependencies. Triggers on: useEffect, useCallback,
  useMemo, biome-ignore, exhaustive-deps.
---

# No biome-ignore for useExhaustiveDependencies

## Rule

Never add `biome-ignore lint/correctness/useExhaustiveDependencies` or any
equivalent suppression (`// eslint-disable-next-line react-hooks/exhaustive-deps`).
There are zero exceptions.

## When the linter flags a missing dependency

Fix the code instead of silencing the warning:

1. **Add the dependency** — if it causes unwanted re-runs, stabilize its identity
   (extract to a ref, memoize, or lift out of render).
2. **Use a ref** for values you need to read without re-triggering the effect.
3. **Split the effect** into smaller effects with correct dependency arrays.
4. **Restructure the hook** so the problematic dependency doesn't exist.

If none of these work, the design needs rethinking — not a lint suppression.
