# 📖 Playbook: Codebase Scanning and Synchronization with Synapse Repo Indexer

This playbook redirects developers and AI agents to the core codebase scanning tool (indexer). The indexer parses source files to build an AST dependency graph and synchronizes it to the local Synapse Portal database.

> [!CAUTION]
> **NO MANUAL DIRECTORY EXPLORATION**: When this playbook is active, you are strictly prohibited from using manual file-traversal tools (e.g. `list_dir`) to analyze the project directory structures. If the database graph is empty, you MUST first run the indexing sync script to build the AST index, and then query the dependency graph via the provided API endpoints.

## 🎯 Trigger Conditions

- **When starting a new project (Brownfield):** Helps AI agents understand the entire repository structure right from the beginning.
- **After major refactoring:** When you rename, relocate, or restructure major folders, files, classes, or dependencies.
- **Before starting a new Sprint:** Ensures the agent's context and graph remain perfectly synced with the actual codebase.

## ⚙️ Workflows & Architecture

Please refer directly to the [synapse-repo-indexer](../skills/synapse-repo-indexer/SKILL.md) for all instructions, CLI commands, and API details.

### Core Workflows Reference

- **PORTAL SYNC Workflow:** Scan and sync codebase structures from the workspace terminal.
- **PORTAL QUERY Workflow:** Query the dependency graph or reverse impact programmatically.
