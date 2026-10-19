# Context Hygiene & Garbage Collection (GC)

## Purpose
Prevents `agents.md` from expanding into an unwieldy flat document that wastes LLM token budgets and causes attention degradation.

## Pruning & Compression Rules
1. **No Micro-Commit Logs**: Do not log CSS pixel shifts (e.g., "geser 4px ke atas", "ubah padding 2px"), temporary debugging fixes, or ephemeral styling iterations in `agents.md`.
2. **Milestone Consolidation**: Log only meaningful architectural milestones or new complete features.
3. **Threshold Pruning**: When `agents.md` exceeds 350 lines, prune completed sub-tasks and merge older phase entries into a concise milestone paragraph.
4. **Archiving**: Exhaustive historical changelogs belong in `_harness/changelog_archive.md`, leaving the root `agents.md` lean, executive, and actionable.
