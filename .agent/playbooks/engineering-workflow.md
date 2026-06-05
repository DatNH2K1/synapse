# Engineering Workflow (Daily Code Development)

> [!MANDATORY]
> **COMPLIANCE IS STRICTLY ENFORCED**: Any deviation from this pipeline will lead to failure in task execution. Before starting any task, the Agent MUST verify compliance with each of the steps below.

Follow this pipeline for any coding, testing, analysis, or development task:

1. **Ground (JIT Retrieval - MANDATORY)**:
   - Before executing any `synapse-` skills or starting a task, you MUST perform JIT Retrieval using the `synapse-memory` skill (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-read-workflow-jit-grounding) for exact query workflows and tags filtering).
   - **Codebase Analysis & Indexing**: If the user asks you to analyze codebase structures, inspect dependencies, or perform any code-related investigations, you **MUST NOT** rely on simple file listing or manual folder browsing. You **MUST** check if the repository is already indexed by querying the indexer APIs.
     - **CRITICAL**: Before calling the indexer API (`GET /api/indexer/ai/graph?repo=<repo_name>`), check the last sync time of the repository (via `GET /api/indexer/repos`). If the last sync time was **more than 1 hour ago** or the repository is not indexed yet, you **MUST** warn the user/output a warning recommending a sync before continuing.
     - To run the indexer, use the `synapse-repo-indexer` skill (refer to [synapse-repo-indexer](../skills/synapse-repo-indexer/SKILL.md) for execution commands, making sure to specify `--path` if indexing a repository other than the current workspace) or query its API directly via local port `{SYNAPSE_PORTAL_PORT}`.
2. **Execute & Track (MANDATORY)**:
   - Use specialized skills in `skills/`.
   - **Context Guard**: Monitor the `<usage-awareness>` context window usage. If it exceeds **70%**, you MUST trigger context optimization (refer to [context-engineering](../skills/synapse-context-engineering/SKILL.md) for details on analyzing and optimizing active context).
3. **Finalize (Memory Persistence & Efficacy Tracking - MANDATORY)**: At the end of any task, bug fix, story, or feature completion, perform final maintenance using the `synapse-memory` skill:
   - **Track Efficacy**: If you successfully applied any retrieved lessons from Step 1, you MUST increment their success count to track their efficacy (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-efficacy-workflow) for exact instructions and commands). Extract the `node-id` from the **Reference ID** field in the JIT retrieval output.
   - **Persist Memory**: Record new reusable insights (lessons learned, new feature structures, or high-level architecture changes) to the Portal (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-write-workflow) for node type selection and parameters).
   - All text details MUST be written in English.
4. **No Direct Hook API Bypass**: Do not bypass the `synapse-memory` scripts by writing raw API client calls for memory sync; always use the canonical tools provided by the `synapse-memory` skill.

