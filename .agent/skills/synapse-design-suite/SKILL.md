---
name: synapse-design-suite
description: "Master Design Suite: A comprehensive design intelligence layer covering UX Strategy, Visual Design, AI Art Generation, and Frontend Implementation."
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

# Master Design Suite

This skill is the creative engine of Synapse. It intelligently orchestrates the design process, from wireframing and UX research to high-fidelity UI generation and frontend coding.

## 🚦 INTELLIGENCE DISPATCHER & SUB-SKILL REGISTRY

When executing any layer, you MUST refer to the registry table below and **only load/query the sub-skills whose Activation Criteria match the current task context** (Lazy/Conditional Loading pattern) to prevent token waste and context bloat. Do NOT load sub-skills whose activation criteria are not met.

| Sub-Skill                | Portable Path                                                                              | Primary Role                                           | Activation Criteria                                                                                  |
| :----------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **UX Pro Max**           | [`./references/ui-ux-pro-max/SKILL.md`](./references/ui-ux-pro-max/SKILL.md)               | Design rules, colors, accessibility checklists         | Triggered on ANY UX, layout, or component creation/edit                                              |
| **AI Artist**            | [`./references/ai-artist/SKILL.md`](./references/ai-artist/SKILL.md)                       | Prompts, image & asset generation                      | Triggered when generating placeholders, mockups, or icons                                            |
| **Google Stitch**        | [`./references/stitch/SKILL.md`](./references/stitch/SKILL.md)                             | Design-to-code translation rules                       | Triggered when converting UI to React/CSS code AND STITCH_API_KEY environment variable is configured |
| **UX Design**            | [`./references/ux-design/SKILL.md`](./references/ux-design/SKILL.md)                       | UX strategy, user research, wireframing guidelines     | Triggered on UX planning and sitemaps                                                                |
| **Frontend Design**      | [`./references/frontend-design/SKILL.md`](./references/frontend-design/SKILL.md)           | Native styling, layout architecture, and styling rules | Triggered when structuring HTML/CSS/Tailwind layout                                                  |
| **React Best Practices** | [`./references/react-best-practices/SKILL.md`](./references/react-best-practices/SKILL.md) | Code quality, React component conventions, hooks       | Triggered when writing or refactoring React code                                                     |

---

## 🛠️ ACTIVE INTEGRATION WORKFLOWS

### 1. Concept to Visuals (Dynamic Linking)

- Before creating visual concepts, you **MUST** run `ai-artist/scripts/search.py` or read `ai-artist/data/awesome-prompts.csv` to match the concept with the best curated prompts.
- Perform a validation interview (unless `--skip` is used) matching design guidelines from `ui-ux-pro-max`.

### 2. Design to Code (Google Stitch)

- When converting designs to code, check `ui-ux-pro-max` for the target stack guidelines (e.g., React/Tailwind).
- Auto-generate the Light/Dark mode color tokens using semantic definitions in `ui-ux-pro-max` color palettes.

---

## 🔒 AUTOMATED QUALITY CHECKPOINTS

Before delivering any UI component or mockup:

- [ ] **Touch Target Check**: Verify all interactive elements have a minimum size of 44×44pt (per `ui-ux-pro-max/SKILL.md` §2).
- [ ] **Contrast Verification**: Ensure text and icons meet WCAG 4.5:1 contrast standards (per `ui-ux-pro-max/SKILL.md` §1).
- [ ] **No Emoji Rule**: Verify that vector SVGs are used instead of raw emojis for icons (per `ui-ux-pro-max/SKILL.md` §4).

---

## 📂 FULL REFERENCES (Portable Relative Paths)

The Master Suite maintains the full integrity of all specialized Design methodologies:

### UX & Strategy

- [UX Design Specifications](./references/ux-design/SKILL.md)
- [UI/UX Intelligence (Pro Max)](./references/ui-ux-pro-max/SKILL.md)

### Visual & AI Generation

- [AI Artist (Image Generation)](./references/ai-artist/SKILL.md)
- [Google Stitch Integration](./references/stitch/SKILL.md)

### Implementation

- [Frontend Design Engine](./references/frontend-design/SKILL.md)
- [React/Next.js Best Practices](./references/react-best-practices/SKILL.md)

## USAGE

"Design a landing page for X", "Generate a logo for my app", "Review the UX of this form", or "Convert this design into React code". The Master Suite will coordinate the expert layers and enforce the quality checkpoints.
