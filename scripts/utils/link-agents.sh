#!/usr/bin/env bash
# =============================================================================
# link-agents.sh
# Creates symlinks from skills/ → agents/ so AGY IDE can discover all agents
# as skills during its automatic skills/ directory scan.
#
# Usage:
#   bash scripts/utils/link-agents.sh
#
# Run from the synapse project root directory.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENTS_DIR="$PROJECT_ROOT/.agent/agents"
SKILLS_DIR="$PROJECT_ROOT/.agent/skills"

if [[ ! -d "$AGENTS_DIR" ]]; then
  echo "ERROR: agents/ directory not found at $AGENTS_DIR"
  exit 1
fi

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "ERROR: skills/ directory not found at $SKILLS_DIR"
  exit 1
fi

echo "🔗 Synapse — Linking agents/ into skills/ for AGY discovery..."
echo "   Project root : $PROJECT_ROOT"
echo "   Agents dir   : $AGENTS_DIR"
echo "   Skills dir   : $SKILLS_DIR"
echo ""

created=0
skipped=0
errors=0

for agent_dir in "$AGENTS_DIR"/*/; do
  if [[ ! -d "$agent_dir" ]]; then
    continue
  fi

  agent_name="$(basename "$agent_dir")"
  symlink_path="$SKILLS_DIR/$agent_name"
  # Relative target so symlink works regardless of absolute path
  relative_target="../agents/$agent_name"

  # Skip if SKILL.md doesn't exist in agent dir
  if [[ ! -f "$agent_dir/SKILL.md" ]]; then
    echo "  ⚠️  SKIP $agent_name — no SKILL.md found"
    ((skipped++)) || true
    continue
  fi

  # Remove stale symlink if target changed
  if [[ -L "$symlink_path" ]]; then
    existing_target="$(readlink "$symlink_path")"
    if [[ "$existing_target" == "$relative_target" ]]; then
      echo "  ✅ EXISTS $agent_name (symlink already correct)"
      ((skipped++)) || true
      continue
    else
      echo "  🔄 UPDATE $agent_name (was: $existing_target)"
      rm "$symlink_path"
    fi
  elif [[ -e "$symlink_path" ]]; then
    echo "  ❌ ERROR  $agent_name — path exists but is NOT a symlink: $symlink_path"
    ((errors++)) || true
    continue
  fi

  # Create the symlink
  ln -s "$relative_target" "$symlink_path"
  echo "  ➕ LINKED $agent_name → $relative_target"
  ((created++)) || true
done

# Link the entire skills folder to the project root
echo ""
echo "🔗 Linking skills folder to project root..."
ROOT_SKILLS_LINK="$PROJECT_ROOT/skills"
if [[ -L "$ROOT_SKILLS_LINK" ]]; then
  existing_target="$(readlink "$ROOT_SKILLS_LINK")"
  if [[ "$existing_target" == ".agent/skills" ]]; then
    echo "  ✅ ROOT skills symlink already exists and is correct."
  else
    echo "  🔄 Updating ROOT skills symlink (was: $existing_target)"
    rm "$ROOT_SKILLS_LINK"
    ln -s ".agent/skills" "$ROOT_SKILLS_LINK"
  fi
elif [[ -e "$ROOT_SKILLS_LINK" ]]; then
  echo "  ❌ ERROR: $ROOT_SKILLS_LINK exists but is NOT a symlink!"
  errors=$((errors + 1))
else
  ln -s ".agent/skills" "$ROOT_SKILLS_LINK"
  echo "  ➕ LINKED skills → .agent/skills"
fi

echo ""
echo "Done! Created: $created | Already OK: $skipped | Errors: $errors"

if [[ $errors -gt 0 ]]; then
  echo "⚠️  Some symlinks failed. Check errors above."
  exit 1
fi

