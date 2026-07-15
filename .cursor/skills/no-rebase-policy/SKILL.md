---
name: no-rebase-policy
description: Enforce a merge-only Git workflow. Use when discussing git history changes, updating branches, syncing with upstream, or when the user mentions rebase or upstream. The policy is to never rebase (especially against upstream) and to use merges instead because upstream rebases are extremely large.
---

# No Rebase Policy

## Instructions

- Never run or suggest `git rebase`.
- Prefer merge-based updates for all branch syncs.
- If the user asks for a rebase, explain that upstream rebases are gigantic and switch to a merge-based approach.
- Offer safe merge alternatives and keep history intact.

## Suggested Commands

- Update branch from main:
  - `git fetch origin`
  - `git merge origin/main`
- Fast-forward only when possible:
  - `git pull --ff-only`
- Bring upstream into a fork without rebasing:
  - `git fetch upstream`
  - `git merge upstream/main`

## Examples

**User:** "Rebase this branch onto upstream/main"

**Assistant:** "We avoid rebasing here because upstream rebases are huge. I'll merge instead: `git fetch upstream` then `git merge upstream/main`."
