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
PORTAL_API_URL = f"http://localhost:{PORTAL_PORT}/api/nodes/efficacy"

def record_efficacy(node_id):
    payload = {
        "nodeId": node_id
    }

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
                print(f"✅ Success: Registered successful application of Lesson (ID: {node_id}). New Efficacy Count: {result.get('successCount')}")
            else:
                print(f"❌ Failed: {resp.status}")
                sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to Portal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synapse Lesson Efficacy Tracker")
    parser.add_argument("--node-id", required=True, help="UUID of the Lesson node that was applied successfully")
    
    args = parser.parse_args()
    record_efficacy(args.node_id)
