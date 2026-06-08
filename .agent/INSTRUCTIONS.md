# Synapse Project — AI Agent Instructions

> [!IMPORTANT]
> **LOCAL SINGLE-USER SYSTEM ONLY**: Synapse is strictly a local, offline, single-user system. There is no multi-tenant, multi-user, or cloud collaboration context. All database schemas, API routes, and UI designs MUST be optimized for a single local developer (User), prioritizing simplicity, zero network latency, and lightweight local resource usage (e.g., removing heavy vector embeddings of archived/rejected nodes).

## Key Resources

- **Agent Manifest**: [agent-manifest.csv](./manifests/agent-manifest.csv)
- **Skill Manifests**: [skill-manifest.csv](./manifests/skill-manifest.csv) & [addition-skill-manifest.csv](./manifests/addition-skill-manifest.csv)
- **Portal Source**: [synapse-portal](../synapse-portal/)
- **Repo Index Skill**: [synapse-repo-indexer](./skills/synapse-repo-indexer/)

## Playbooks

> [!IMPORTANT]
> **🛑 MANDATORY PLAYBOOK SELECTION PROTOCOL (DO NOT SKIP)**
> The AI agent MUST NOT automatically guess, predict, or select a playbook on its own.
> You MUST stop the execution flow and ask the user to explicitly select the active playbook for the task before executing any code changes, calling other tools (except for reading instructions/prerequisites), or proceeding with the task.
> Bypassing this step or executing tools without the user explicitly choosing the playbook is a strict protocol violation.
> **Note**: If the user does not select a playbook, default to "Engineering Workflow".
> Once the playbook is chosen or defaulted, you MUST explicitly state the active Playbook in your response (e.g., `Active Playbook: Engineering Workflow`) and follow its instructions.
> **CRITICAL RULE**: When a Playbook is active, the Agent MUST prioritize using its defined APIs, skills, and automated workflows for investigation and implementation. Relying on manual directory listing (`list_dir`) or generic folder crawling to understand the project structure is strictly prohibited if specialized query APIs or indexer tools are available.

### Prerequisite: Initialize (Mandatory for all tasks)

Always run `PYTHONPATH=scripts/utils python3 scripts/utils/env_loader.py` to retrieve environment configuration safely before executing any playbooks or skills. DO NOT read the `.env` file directly with `view_file` to avoid exposing sensitive keys (such as `GEMINI_API_KEY` or `POSTGRES_PASSWORD`). The keys returned are:

- `SYNAPSE_USER_NAME` (resolves `{user_name}`)
- `SYNAPSE_COMMUNICATION_LANGUAGE` (resolves `{communication_language}`)
- `SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE` (resolves `{document_output_language}`)
- `SYNAPSE_OUTPUT_FOLDER` (resolves `{output_folder}`)
- `SYNAPSE_PORTAL_PORT` (resolves `{docker_port}`)

### Execution Policy: Prefer Docker in Target Repos

When using a skill to work on another repository, verify Docker in that target repository before running development commands. If the target repo has Docker available and the relevant service/container can be reached, prefer containerized execution over running the same command directly on the host.

- Use `docker compose exec` for app commands when the target service container is running.
- Use the target repo's `docker compose up` / `docker compose -f ... up` flow for local stacks instead of starting host-side processes when the repo already supports Docker.
- Fall back to host execution only when Docker is unavailable in the target repo, the container is not running, or the task explicitly requires host-only tooling.
- Keep the decision local to the target repo: check Docker first, then choose the shortest safe path for the command you need to run.

> [!MANDATORY]
> **PLAYBOOK COMPLIANCE IS STRICTLY COMPULSORY**: You MUST read and follow the referenced playbook for the respective activation context before starting work. Relying on default memory or bypassing these playbooks is a protocol violation.

Based on your active task type, refer to and follow the appropriate playbook below:

| Playbook                 | Link                                                        | Description                                                                                 | Activation Context                                                                  |
| :----------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| **Engineering Workflow** | [engineering-workflow](./playbooks/engineering-workflow.md) | Standard flow for JIT retrieval, development, testing, and memory recording.                | Whenever performing a code implementation, task, feature, or bug fix.               |
| **Repo Indexer**         | [repo-indexer](./playbooks/repo-indexer.md)                 | Flow for scanning codebase structures and syncing dependency graphs to the Portal database. | When starting a new project, after significant refactoring, or before a new sprint. |

## Sub-agent Delegation Rules

When spawning, managing, and coordinating sub-agents (via `invoke_subagent` or `define_subagent`), you MUST strictly adhere to these protocols:

### 1. Sub-agent Status Protocol (MANDATORY)

Every sub-agent MUST end its final response using this exact status report format:

```
**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
**Summary:** [1-2 sentence summary of results]
**Concerns/Blockers:** [Detailed explanation if status is not DONE]
```

- **DONE**: Task completed successfully. Proceed to next step.
- **DONE_WITH_CONCERNS**: Completed but with potential risks or tech debt.
- **BLOCKED**: Cannot proceed due to error or external factor. Resolve blocker before retrying.
- **NEEDS_CONTEXT**: Missing information. Ask user or parent agent, then re-dispatch.

### 2. Context Isolation Principle

To prevent context window degradation, sub-agents MUST receive only high-signal, relevant data:

- **No Session Bloat**: Do NOT pass full session/chat history to sub-agents. Summarize previous decisions.
- **Explicit Scoping**: Provide specific task prompts, exact file paths, and list which files to read or modify.
- **Project Pathing**: Always include `Work context: [root path]` in sub-agent prompts.

### 3. Delegation & Escalation Rules

- **Parallelism**: Spawn independent tasks simultaneously (e.g. Frontend and Backend tasks).
- **Sequential Chaining**: Run tasks sequentially when a step depends on the output of the previous one (e.g. Plan -> Code -> Test).
- **Explicit Scoping**: All queries and records MUST include the `project:<name>` tag AND the calling agent's tag (e.g., `agent:synapse-agent-web-dev`):
  - The agent tag value **MUST** be the canonical agent folder name (e.g. the directory name under `agents/`, or the `name` column in [agent-manifest.csv](./manifests/agent-manifest.csv)), NOT the persona display name.
  - Refer to [agent-manifest.csv](./manifests/agent-manifest.csv) to retrieve the list of valid agents.
  - **CRITICAL**: Orchestrators/modes (such as `synapse-party-mode` or `party-mode`) are NOT agents and MUST NEVER be used as the agent tag value.
  - When recording lessons/insights during Party Mode, the node MUST be tagged with the specific agent who contributed the insight (e.g., `agent:synapse-agent-architect`), not the orchestrator/mode.
- **Escalation**: If a sub-agent fails 3+ times on the same task, escalate to the User immediately.
- **Skill Discovery & Lazy Loading**: Parent agents should select and inject relevant skill paths into the sub-agent prompt. If a sub-agent receives a complex/specialized task without specific skill pointers, it MUST lazily read both [skill-manifest.csv](./manifests/skill-manifest.csv) and [addition-skill-manifest.csv](./manifests/addition-skill-manifest.csv) (if it exists) to discover and load matching skills instead of writing custom code or solutions from scratch.
