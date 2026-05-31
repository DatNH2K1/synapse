---
name: synapse-repo-indexer
description: Build a lightweight repo index from filesystem signals only. Use when the user needs a fast AI-facing map of an unfamiliar project without a preexisting manifest or metadata.
---

# Repo Indexer

Generate a cheap, local-first index for an unfamiliar repository using only the filesystem and shallow code hints.

## Use When

- The repo has no useful manifest.
- The user wants an AI-friendly project map before deeper analysis.
- You need to avoid reading every file in full.

## Workflow

1. Scan the tree.
   - Record folders, filenames, extensions, and file sizes.
   - Skip obvious noise like vendor, cache, build output, and lockfiles unless the user wants them included.
2. Extract shallow signals.
   - Sample only enough content to detect exports, classes, functions, routes, tests, schemas, and configs.
   - Do not infer project meaning from full-file reading.
3. Rank the repo.
   - Prioritize entrypoints, configs, routes, tests, and top-level modules.
   - Deprioritize generated files and large leaf files with no clear role.
4. Emit a compact index.
   - Prefer one short line per file or module.
   - Keep descriptions factual and local to what is observable.
   - Use the bundled script to do the scan instead of hand-reading the tree.

## Output Shape

- Root summary: what the repo appears to be from path and file signals.
- Tree summary: notable directories and files.
- Priority list: all indexed files, ordered by likely value.
- Notes: uncertainty, generated areas, and places needing deeper inspection.

## Heuristics

- Treat `README`, entrypoints, configs, routes, and tests as high priority.
- Use filename and path conventions before opening file bodies.
- Use shallow code hints only when they are cheap to extract.
- If the repo is large, stop at a useful partial index instead of forcing full coverage.

## Script

Use `scripts/index_repo.py` to generate the index.

- The current working directory is the repo root.
- Default output file is `.agent/repo-index.md`.
- `--format json` writes JSON instead of markdown.

## Constraints

- Keep the index cheap to generate.
- Do not invent semantics the filesystem does not support.
- Prefer a minimal stale-tolerant inventory over a fragile smart summary.
