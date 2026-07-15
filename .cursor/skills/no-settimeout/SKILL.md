---
name: no-settimeout
description: >-
  Never use setTimeout (or window.setTimeout) in frontend code without explicit
  user approval. Use when writing, editing, or reviewing any frontend
  TypeScript/JavaScript code. Triggers on: setTimeout, window.setTimeout,
  delay, timer, debounce, polling, retry, useEffect, setInterval.
---

# No setTimeout in Frontend Code

## Rule

Never introduce `setTimeout` or `window.setTimeout` in any production file
under `frontend/`. This covers components, hooks, services, and utilities.
Every use requires the user's explicit approval during the conversation.

`setInterval` is subject to the same restriction.

**Exception — tests are fine.** Files under `__tests__/`, `*.test.*`, and
`*.spec.*` may use `setTimeout` / `setInterval` freely (e.g., for faking
timers, simulating delays, or advancing clocks).

## When you think a timeout is needed

**Stop and ask the user first.** Present:

1. **Why** you believe a timeout is necessary.
2. **Where** it would be added (file and function).
3. **The exact duration** and what triggers it.
4. **Alternatives considered** (see below).

Only proceed if the user explicitly approves.

## Preferred alternatives

Before proposing a timeout, evaluate these options:

| Instead of setTimeout for… | Use |
|---|---|
| Waiting for DOM updates | `requestAnimationFrame`, `flushSync`, or a layout effect |
| Debouncing user input | A controlled debounce utility (e.g., `useDebouncedValue` hook) that the user has already approved |
| Polling for data | React Query / TanStack Query `refetchInterval` |
| Delaying UI transitions | CSS `transition` / `animation` with `transitionend` events |
| Retry logic | Exponential back-off inside the fetching layer (e.g., React Query `retry`) |
| Sequencing async work | `async`/`await` or Promises |

## Reviewing existing code

When editing a file that already contains `setTimeout`:

- Do **not** silently preserve it. Flag it to the user and suggest a
  replacement from the alternatives table above.
- Do **not** remove it without the user's approval either — just raise
  awareness.
