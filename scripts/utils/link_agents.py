#!/usr/bin/env python3
import os
import sys
import shutil
import csv

def parse_frontmatter(skill_md_path):
    name = ""
    description = ""
    if not os.path.isfile(skill_md_path):
        return name, description
    try:
        with open(skill_md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        if lines and lines[0].strip() == '---':
            fm_lines = []
            for line in lines[1:]:
                if line.strip() == '---':
                    break
                fm_lines.append(line)
            
            in_description_block = False
            desc_lines = []
            
            for line in fm_lines:
                # If we are in block scalar description
                if in_description_block:
                    # Check if line starts with a new key (no leading whitespace and has a colon)
                    if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
                        in_description_block = False
                    else:
                        desc_lines.append(line)
                        continue
                
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip().lower()
                    val = val.strip()
                    
                    if key == 'name':
                        name = val.strip("'").strip('"')
                    elif key == 'description':
                        # Check if block scalar starts
                        if val in ['>', '|', '>-', '|-']:
                            in_description_block = True
                        else:
                            description = val.strip("'").strip('"')
            
            if desc_lines:
                merged = " ".join([l.strip() for l in desc_lines]).strip()
                description = merged.strip("'").strip('"')
                
    except Exception as e:
        print(f"Error parsing frontmatter of {skill_md_path}: {e}")
    return name, description

def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    agents_dir = os.path.join(project_root, ".agent", "agents")
    skills_dir = os.path.join(project_root, ".agent", "skills")
    manifests_dir = os.path.join(project_root, ".agent", "manifests")

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

    # Link all available AG skills from ~/.gemini/config/plugins
    print("\n🔍 Discovering and linking external AG skills...")
    plugins_root = os.path.expanduser("~/.gemini/config/plugins")
    additional_skills = []

    if os.path.isdir(plugins_root):
        for plugin_name in sorted(os.listdir(plugins_root)):
            if plugin_name == "synapse":
                continue  # Skip our own plugin to avoid cycles
            
            plugin_path = os.path.join(plugins_root, plugin_name)
            if not os.path.isdir(plugin_path):
                continue
            
            ext_skills_dir = os.path.join(plugin_path, "skills")
            if os.path.isdir(ext_skills_dir):
                for skill_name in sorted(os.listdir(ext_skills_dir)):
                    ext_skill_path = os.path.join(ext_skills_dir, skill_name)
                    if not os.path.isdir(ext_skill_path):
                        continue
                    
                    skill_md_path = os.path.join(ext_skill_path, "SKILL.md")
                    if not os.path.isfile(skill_md_path):
                        # Try lowercase skill.md
                        skill_md_path = os.path.join(ext_skill_path, "skill.md")
                    
                    if not os.path.isfile(skill_md_path):
                        continue
                    
                    # Target symlink path inside .agent/skills
                    symlink_path = os.path.join(skills_dir, skill_name)
                    
                    # Remove stale symlink if it exists
                    if os.path.islink(symlink_path):
                        existing_target = os.readlink(symlink_path)
                        if existing_target == ext_skill_path:
                            skipped += 1
                        else:
                            os.remove(symlink_path)
                            os.symlink(ext_skill_path, symlink_path)
                            created += 1
                    elif os.path.exists(symlink_path):
                        print(f"  ❌ ERROR  {skill_name} — path exists but is NOT a symlink: {symlink_path}")
                        errors += 1
                        continue
                    else:
                        try:
                            os.symlink(ext_skill_path, symlink_path)
                            created += 1
                        except Exception as e:
                            print(f"  ❌ ERROR  {skill_name} — failed to create symlink: {str(e)}")
                            errors += 1
                            continue

                    # Parse name and description
                    parsed_name, parsed_desc = parse_frontmatter(skill_md_path)
                    if not parsed_name:
                        parsed_name = skill_name
                    if not parsed_desc:
                        parsed_desc = f"Antigravity skill: {skill_name}"
                    
                    additional_skills.append({
                        "canonicalId": skill_name,
                        "name": parsed_name,
                        "description": parsed_desc,
                        "module": plugin_name,
                        "path": f"skills/{skill_name}/SKILL.md"
                    })
                    print(f"  ✅ LINKED AG SKILL: {skill_name} ({parsed_name})")
    
    # Write addition-skill-manifest.csv
    addition_manifest_path = os.path.join(manifests_dir, "addition-skill-manifest.csv")
    try:
        with open(addition_manifest_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
            writer.writerow(['canonicalId', 'name', 'description', 'module', 'path'])
            for skill in additional_skills:
                writer.writerow([
                    skill['canonicalId'],
                    skill['name'],
                    skill['description'],
                    skill['module'],
                    skill['path']
                ])
        print(f"\n📝 Generated manifest: {addition_manifest_path}")
    except Exception as e:
        print(f"❌ ERROR writing addition-skill-manifest.csv: {str(e)}")
        errors += 1

    print(f"\nDone! Created: {created} | Already OK: {skipped} | Errors: {errors}")
    if errors > 0:
        print("⚠️  Some symlinks failed. Check errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
