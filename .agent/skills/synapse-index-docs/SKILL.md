---
name: synapse-index-docs
description: 'Generates or updates an index.md to reference all docs in the folder. Use if user requests to create or update an index of all files in a specific folder'
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
> [!IMPORTANT]
> **COMPLIANCE RULE:** You MUST output the following checklist with `[x]` at the very beginning of your response to the user to confirm you have completed these steps. Do NOT proceed with the user request until this checklist is printed.

- [ ] **System Instructions**: Read global instructions at `../../.agent/INSTRUCTIONS.md` (relative to this skill file).
- [ ] **Playbook Selection**: Per INSTRUCTIONS.md — ask user to explicitly select the active Playbook (e.g. `engineering-workflow` or `repo-indexer`) and state which was chosen.

> [!MANDATORY]
> **STOP!** If these items are not checked and printed in your response, you are NOT ALLOWED to proceed. Compliance is mandatory.

# Index Docs

**Goal:** Generate or update an index.md to reference all docs in a target folder.

## EXECUTION

### Step 1: Scan Directory

- List all files and subdirectories in the target location

### Step 2: Group Content

- Organize files by type, purpose, or subdirectory

### Step 3: Generate Descriptions

- Read each file to understand its actual purpose and create brief (3-10 word) descriptions based on the content, not just the filename

### Step 4: Create/Update Index

- Write or update index.md with organized file listings

## OUTPUT FORMAT

```markdown
# Directory Index

## Files

- **[filename.ext](./filename.ext)** - Brief description
- **[another-file.ext](./another-file.ext)** - Brief description

## Subdirectories

### subfolder/

- **[file1.ext](./subfolder/file1.ext)** - Brief description
- **[file2.ext](./subfolder/file2.ext)** - Brief description

### another-folder/

- **[file3.ext](./another-folder/file3.ext)** - Brief description
```

## HALT CONDITIONS

- HALT if target directory does not exist or is inaccessible
- HALT if user does not have write permissions to create index.md

## VALIDATION

- Use relative paths starting with ./
- Group similar files together
- Read file contents to generate accurate descriptions - don't guess from filenames
- Keep descriptions concise but informative (3-10 words)
- Sort alphabetically within groups
- Skip hidden files (starting with .) unless specified