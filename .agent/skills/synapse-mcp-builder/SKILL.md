---
name: synapse-mcp-builder
description: Build MCP servers for LLM-external service integration. Supports FastMCP (Python) and MCP SDK (Node/TypeScript).
argument-hint: "[service or API to integrate]"
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
> [!IMPORTANT]
> **COMPLIANCE RULE:** You MUST output the following checklist with `[x]` at the very beginning of your response to the user to confirm you have completed these steps. Do NOT proceed with the user request until this checklist is printed.

- [ ] **System Instructions**: Read global instructions at `../../.agent/INSTRUCTIONS.md` (relative to this skill file).
- [ ] **Playbook Selection**: Per INSTRUCTIONS.md — ask user to explicitly select the active Playbook (e.g. `engineering-workflow` or `repo-indexer`) and state which was chosen.

> [!MANDATORY]
> **STOP!** If these items are not checked and printed in your response, you are NOT ALLOWED to proceed. Compliance is mandatory.

# MCP Server Development (Agent-Centric Design)

Build Model Context Protocol (MCP) servers to allow AI agents to interact with external tools, APIs, and resources.

## Design Principles

- **Build for Workflows:** Consolidate related operations into high-impact tools.
- **Optimize for Context:** Return high-signal information, not raw data dumps.
- **Actionable Errors:** Error messages should guide agents toward correct usage.
- **Natural Subdivisions:** Tool names should reflect how humans think about tasks.

## Implementation Phases

### 1. Research & Planning
- Study the target API documentation.
- Define the core workflows the agent needs to accomplish.
- Plan input/output schemas (Pydantic/Zod).

### 2. Implementation
- **Python (FastMCP):** Use `@mcp.tool()` for rapid development.
- **Node/TypeScript:** Use `server.registerTool()` for type-safe integration.
- Implement pagination, filtering, and truncation (max 25k tokens).

### 3. Review & Refine
- Ensure DRY (Don't Repeat Yourself) logic.
- Verify security (no hardcoded secrets).
- Check that error messages are "agent-educational".

### 4. Evaluations
- Create a `qa_pair` XML file to test if the LLM can solve complex tasks using the new tools.

## Quick Start (Python)
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("MyServer")

@mcp.tool()
async def get_resource(id: str) -> str:
    """Fetch a resource with clear agent-centric descriptions."""
    return f"Resource data for {id}"
```