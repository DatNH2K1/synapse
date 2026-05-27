#!/usr/bin/env python3
import os
import sys
import shutil

def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    agents_dir = os.path.join(project_root, ".agent", "agents")
    skills_dir = os.path.join(project_root, ".agent", "skills")

    if not os.path.isdir(agents_dir):
        print(f"ERROR: agents/ directory not found at {agents_dir}", file=sys.stderr)
        sys.exit(1)

    if not os.path.isdir(skills_dir):
        print(f"ERROR: skills/ directory not found at {skills_dir}", file=sys.stderr)
        sys.exit(1)

    print("🔗 Synapse — Linking agents/ into skills/ for AGY discovery...")
    print(f"   Project root : {project_root}")
    print(f"   Agents dir   : {agents_dir}")
    print(f"   Skills dir   : {skills_dir}\n")

    created = 0
    skipped = 0
    errors = 0

    for item in sorted(os.listdir(agents_dir)):
        agent_dir = os.path.join(agents_dir, item)
        if not os.path.isdir(agent_dir):
            continue

        agent_name = item
        symlink_path = os.path.join(skills_dir, agent_name)
        relative_target = os.path.join("..", "agents", agent_name)

        # Skip if SKILL.md doesn't exist in agent dir
        if not os.path.isfile(os.path.join(agent_dir, "SKILL.md")):
            print(f"  ⚠️  SKIP {agent_name} — no SKILL.md found")
            skipped += 1
            continue

        # Remove stale symlink if target changed or exists
        if os.path.islink(symlink_path):
            existing_target = os.readlink(symlink_path)
            if existing_target == relative_target:
                print(f"  ✅ EXISTS {agent_name} (symlink already correct)")
                skipped += 1
                continue
            else:
                print(f"  🔄 UPDATE {agent_name} (was: {existing_target})")
                os.remove(symlink_path)
        elif os.path.exists(symlink_path):
            print(f"  ❌ ERROR  {agent_name} — path exists but is NOT a symlink: {symlink_path}")
            errors += 1
            continue

        try:
            os.symlink(relative_target, symlink_path)
            print(f"  ➕ LINKED {agent_name} → {relative_target}")
            created += 1
        except Exception as e:
            print(f"  ❌ ERROR  {agent_name} — failed to create symlink: {str(e)}")
            errors += 1

    # Link the entire skills folder to the project root
    print("\n🔗 Linking skills folder to project root...")
    root_skills_link = os.path.join(project_root, "skills")
    root_relative_target = os.path.join(".agent", "skills")

    if os.path.islink(root_skills_link):
        existing_target = os.readlink(root_skills_link)
        if existing_target == root_relative_target:
            print("  ✅ ROOT skills symlink already exists and is correct.")
        else:
            print(f"  🔄 Updating ROOT skills symlink (was: {existing_target})")
            os.remove(root_skills_link)
            os.symlink(root_relative_target, root_skills_link)
    elif os.path.exists(root_skills_link):
        print(f"  ❌ ERROR: {root_skills_link} exists but is NOT a symlink!")
        errors += 1
    else:
        try:
            os.symlink(root_relative_target, root_skills_link)
            print("  ➕ LINKED skills → .agent/skills")
        except Exception as e:
            print(f"  ❌ ERROR failed to create ROOT symlink: {str(e)}")
            errors += 1

    print(f"\nDone! Created: {created} | Already OK: {skipped} | Errors: {errors}")
    if errors > 0:
        print("⚠️  Some symlinks failed. Check errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
