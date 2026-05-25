import os
import json
import urllib.request
import argparse
import sys

# Resolve the absolute path of scripts/utils and insert into sys.path
utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../scripts/utils"))
sys.path.insert(0, utils_path)

from env_loader import load_env
load_env()

PORTAL_PORT = os.getenv("Synapse_PORTAL_PORT", "3100")
PORTAL_API_URL = f"http://localhost:{PORTAL_PORT}/api/propose"

def record(label, content, node_type, tags):
    payload = {
        "label": label,
        "type": node_type,
        "content": content,
        "tags": tags
    }
    
    # Enforce mandatory section tag for LESSON type
    if node_type == "LESSON":
        if not any(t.startswith("section:") for t in tags):
            print("❌ Error: LESSON requires a section: tag.")
            sys.exit(1)

    try:
        req = urllib.request.Request(
            PORTAL_API_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as resp:
            if resp.status == 200:
                result = json.loads(resp.read().decode())
                print(f"✅ Success: Recorded {node_type} '{label}' (ID: {result.get('id')})")
            else:
                print(f"❌ Failed: {resp.status}")
                sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to Portal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synapse Memory Automation Tool")
    parser.add_argument("--label", required=True)
    parser.add_argument("--content", required=True)
    parser.add_argument("--type", default="LESSON", choices=["LESSON", "CONTEXT", "FEATURE"])
    parser.add_argument("--tags", nargs="+", default=[])
    
    args = parser.parse_args()
    record(args.label, args.content, args.type, args.tags)
