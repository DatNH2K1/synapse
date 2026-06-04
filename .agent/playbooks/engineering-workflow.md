# Engineering Workflow (Daily Code Development)

Follow this pipeline for any coding, testing, or development task:

1. **Ground (JIT Retrieval - MANDATORY)**: Before executing any `synapse-` skills or starting a task, you MUST perform JIT Retrieval using the `synapse-memory` skill (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-read-workflow-jit-grounding) for exact query workflows and tags filtering).
   - If the repository contains `.agent/repo-index.md` from `synapse-repo-indexer`, read that file first before doing deeper filesystem inspection.
2. **Execute & Track (MANDATORY)**:
   - Use specialized skills in `skills/`.
   - **Context Guard**: Monitor the `<usage-awareness>` context window usage. If it exceeds **70%**, you MUST trigger context optimization (refer to [context-engineering](../skills/synapse-context-engineering/SKILL.md) for details on analyzing and optimizing active context).
3. **Finalize (Memory Persistence & Efficacy Tracking - MANDATORY)**: At the end of any task, bug fix, story, or feature completion, perform final maintenance using the `synapse-memory` skill:
   - **Track Efficacy**: If you successfully applied any retrieved lessons from Step 1, you MUST increment their success count to track their efficacy (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-efficacy-workflow) for exact instructions and commands). Extract the `node-id` from the **Reference ID** field in the JIT retrieval output.
   - **Persist Memory**: Record new reusable insights (lessons learned, new feature structures, or high-level architecture changes) to the Portal (refer to [synapse-memory](../skills/synapse-memory/SKILL.md#portal-write-workflow) for node type selection and parameters).
   - All text details MUST be written in English.
4. **No Direct Hook API Bypass**: Do not bypass the `synapse-memory` scripts by writing raw API client calls for memory sync; always use the canonical tools provided by the `synapse-memory` skill.
