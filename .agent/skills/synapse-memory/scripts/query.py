import os
import json
import urllib.request
import urllib.error
import argparse
import sys

from pathlib import Path
import sys

# Add project root directory to sys.path
sys.path.append(str(Path(__file__).resolve().parents[4]))

from scripts.utils.env_loader import load_env
load_env()

PORTAL_PORT = os.getenv("SYNAPSE_PORTAL_PORT", "3100")
PORTAL_API_URL = f"http://localhost:{PORTAL_PORT}/api/context/export"

def query(tags):
    if not tags:
        print("❌ Error: At least one tag must be provided.")
        return

    payload = {"tags": tags, "format": "md"}
    data = json.dumps(payload).encode('utf-8')
    
    try:
        req = urllib.request.Request(PORTAL_API_URL, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req) as resp:
            if resp.status == 200:
                markdown_text = resp.read().decode('utf-8')
                if not markdown_text.strip():
                    print(f"ℹ️ No matching knowledge nodes found for tags: {', '.join(tags)}")
                    return
                
                print(markdown_text)
            else:
                print(f"❌ Failed: Server returned status {resp.status}")
                sys.exit(1)
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print(f"ℹ️ No matching knowledge nodes found for tags: {', '.join(tags)}")
        elif e.code == 500:
            print("❌ Server Error (500): The Portal backend encountered an issue. Please ensure the tags exist and the backend is healthy.")
        else:
            print(f"❌ HTTP Error: {e.code}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to Portal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synapse Context Retrieval Tool")
    parser.add_argument("--tags", nargs="+", required=True, help="Tags to filter by (e.g. project:name)")
    
    args = parser.parse_args()
    query(args.tags)
