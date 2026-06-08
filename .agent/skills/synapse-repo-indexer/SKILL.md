---
name: synapse-repo-indexer
description: Scan and build AST dependency graphs (JS/TS, Python, Go, PHP) for the current or specified project, automatically installing dependencies and syncing directly to the Synapse Portal PostgreSQL database.
---

# Repo Indexer Skill

This skill scans the project's source code (JS/TS, Python, Go, PHP) using static AST Parsing to extract imports/exports and synchronizes them directly to the local Synapse Portal PostgreSQL database. It also provides API endpoints to query these dependency structures.

## Use When

- You need to visualize the dependency graph and analyze the reverse impact (Blast Radius) of a repository.
- You need to index the current workspace or scan any external repository/directory specified by the user.
- You need to programmatically query the dependency relationship or blast radius of a file during research/coding.

## Instructions for AI Agent (AI Agent Execution)

> [!IMPORTANT]
> If you encounter environment errors, missing runtimes (e.g. PHP/Node), or database sync failures, **STOP execution immediately** and report the issue to the user.
> Do NOT attempt to run any ad-hoc diagnostic or troubleshooting commands (e.g., raw Python one-liners, running custom container commands) that are not explicitly defined in this skill file. Allow the user to resolve the environment issue manually first.

---

## ⚙️ PORTAL SYNC Workflow (Indexing)

To scan and synchronize a repository, run the CLI tool from the workspace root.

> [!TIP]
> **Skip Synchronization if Synced Within 1 Hour**: Before running a synchronization, check the last sync time of the repository (e.g., via `GET http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/repos`). If the repository has been synced within the last 1 hour, **SKIP** the synchronization step. There is no need to re-sync.

- **Sync Current Workspace:**

  ```bash
  PYTHONPATH=scripts/utils python3 .agent/skills/synapse-repo-indexer/scripts/index_repo.py
  ```

- **Sync Custom Path / Directory:**
  Use the `--path` parameter to specify another project directory:

  ```bash
  PYTHONPATH=scripts/utils python3 .agent/skills/synapse-repo-indexer/scripts/index_repo.py --path /path/to/target/project
  ```

- **Parsing a Single File (Testing / Verification):**
  To parse a single file and output the parsed exports/imports JSON structure:
  ```bash
  PYTHONPATH=scripts/utils python3 .agent/skills/synapse-repo-indexer/scripts/index_repo.py --parse /path/to/file.ts
  ```

---

## 🔍 PORTAL QUERY Workflow (API Integration)

AI Agents MUST query the Portal's AI-friendly HTTP endpoints to inspect codebase structures, imports/exports, or evaluate blast radius programmatically to avoid context bloat and format mismatches.

> [!NOTE]
> The Portal port must be fetched dynamically using the environment configuration loader. Use the `{SYNAPSE_PORTAL_PORT}` variable loaded from `env_loader.py`.

### 1. Get Dependency Graph (AI-friendly)

Retrieve all files, symbols, and relative dependency relations for a specific repository.

- **Response Format:** Returns a structured mapping of file paths to their defined symbols and list of relative file path dependencies (no raw UUIDs).
- **Endpoint:** `GET http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/ai/graph?repo=<repo_name>`
- **Example request (using python / curl):**
  ```bash
  curl "http://localhost:${SYNAPSE_PORTAL_PORT}/api/indexer/ai/graph?repo=synapse"
  ```

### 2. Get Reverse Impact / Blast Radius (AI-friendly)

Find all files that import or depend on a specific file (Semantic Impact).

- **Response Format:** Returns blast radius partitioned into `directlyAffected` (depth 1) and `indirectlyAffected` (depth > 1 with depth level).
- **Endpoint:** `GET http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/ai/impact?file=<file_path>&repo=<repo_name>`
- **Example request (using python / curl):**
  ```bash
  curl "http://localhost:${SYNAPSE_PORTAL_PORT}/api/indexer/ai/impact?file=src/index.ts&repo=synapse"
  ```

### 3. Get File Details (AI-friendly)

Retrieve detailed symbols, direct imports, and direct dependents for a file.

- **Response Format:** Returns detailed symbols, direct dependencies (imported paths), and direct dependents (importing paths).
- **Endpoint:** `GET http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/ai/details?file=<file_path>&repo=<repo_name>`

### 4. List Scanned Repositories

Retrieve a list of all indexed repositories.

- **Endpoint:** `GET http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/repos`

---

## Automated Steps Executed by the Skill

1. **Auto-Dependency Installation**:
   - If the project contains JS/TS or PHP files, the skill checks and automatically installs `@babel/parser` / `nikic/php-parser` in `package.json` / `composer.json` (as dev dependencies).
   - If the host machine lacks the runtime environments (Node, PHP, Go), the skill automatically detects running Docker Compose container services in the target project to execute the installs and parsing.
2. **AST Parsing Lifecycle**:
   - The CLI writes temporary hidden parser scripts (e.g. `.synapse_parser_temp.js`) in the target project's root folder so that they can be accessed easily from both the host and the container.
   - The parser reads code from `stdin` to extract symbols and dependencies.
   - The CLI automatically deletes the temporary scripts after parsing completes.
3. **Database Synchronization**:
   - The CLI sends the parsed data directly to the API endpoint `POST http://localhost:{SYNAPSE_PORTAL_PORT}/api/indexer/sync` to update PostgreSQL.
