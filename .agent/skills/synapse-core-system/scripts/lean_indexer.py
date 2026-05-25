import os
import json

def scan_skills():
    skills_root = ".agent/skills"
    manifest = []
    
    print(f"Scanning {skills_root}...")
    
    for skill_name in os.listdir(skills_root):
        skill_path = os.path.join(skills_root, skill_name)
        if os.path.isdir(skill_path):
            skill_file = os.path.join(skill_path, "SKILL.md")
            if os.path.exists(skill_file):
                with open(skill_file, 'r') as f:
                    content = f.read()
                    # Extract name and description from frontmatter (rough regex)
                    name = skill_name
                    desc = "No description found"
                    
                    if "name:" in content:
                        name = content.split("name:")[1].split("\n")[0].strip()
                    if "description:" in content:
                        desc = content.split("description:")[1].split("\n")[0].strip()
                        desc = desc.strip("'").strip('"')
                        
                    manifest.append({
                        "id": skill_name,
                        "name": name,
                        "description": desc,
                        "path": skill_path
                    })

    # Save as JSON manifest
    with open(".agent/skills/synapse-core-system/synapse-skill-manifest.json", "w") as f:
        json.dump(manifest, f, indent=4)
    
    print(f"Successfully indexed {len(manifest)} Master Skills.")
    for m in manifest:
        print(f"- {m['name']} ({m['id']})")

if __name__ == "__main__":
    scan_skills()
