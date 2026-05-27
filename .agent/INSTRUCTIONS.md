# Synapse Project — AI Agent Instructions

> [!IMPORTANT]
> **LOCAL SINGLE-USER SYSTEM ONLY**: Synapse is strictly a local, offline, single-user system. There is no multi-tenant, multi-user, or cloud collaboration context. All database schemas, API routes, and UI designs MUST be optimized for a single local developer (User), prioritizing simplicity, zero network latency, and lightweight local resource usage (e.g., removing heavy vector embeddings of archived/rejected nodes).

## Key Resources
- **Agent Manifest**: [.agent/manifests/agent-manifest.csv](file://.agent/manifests/agent-manifest.csv)
- **Portal Source**: [synapse-portal/](file://synapse-portal/)

## Workflow
1. **Initialize**: Run `PYTHONPATH=scripts/utils python3 scripts/utils/get_env_safe.py` to retrieve environment configuration safely. DO NOT read the `.env` file directly with `view_file` to avoid exposing sensitive keys (such as `GEMINI_API_KEY` or `POSTGRES_PASSWORD`). The keys returned are:
   - `SYNAPSE_USER_NAME` (resolves `{user_name}`)
   - `SYNAPSE_COMMUNICATION_LANGUAGE` (resolves `{communication_language}`)
   - `SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE` (resolves `{document_output_language}`)
   - `SYNAPSE_OUTPUT_FOLDER` (resolves `{output_folder}`)
   - `SYNAPSE_PORTAL_PORT` (resolves `{docker_port}`)
2. **Ground (JIT Retrieval - MANDATORY)**: Before executing any `synapse-` skills or starting a task, you MUST perform JIT Retrieval via `python3 skills/synapse-memory/scripts/query.py --tags "project:<project_name>"` (where project name is retrieved from the active workspace).
3. **Execute**: Use specialized skills in `skills/`.
4. **Finalize (Memory Persistence - MANDATORY)**: At the end of any task, bug fix, story, or feature completion, record insights to the Portal (you may run the record script multiple times to create separate nodes if there are multiple distinct insights to preserve):
   - Command: `python3 skills/synapse-memory/scripts/record.py --type <LESSON|CONTEXT|FEATURE> --label "<title>" --content "<markdown_content>" --tags "project:<project_name>" "section:<section_tag>" ...`
   - **CRITICAL Rules**:
     - Only record significant, reusable insights.
     - Do NOT record minor refactorings (e.g. renaming classes/functions), small bug fixes, or minor tweaks.
     - Follow strict node type selection criteria (LESSON, FEATURE, CONTEXT) defined in the memory skill.
     - All text details MUST be written in English.
5. **No Direct Hook API Bypass**: Do not bypass the `synapse-memory` scripts by writing raw API client calls for memory sync; always use the canonical `query.py` and `record.py` tools.
