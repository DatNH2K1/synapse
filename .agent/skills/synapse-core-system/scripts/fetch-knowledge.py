import os
import sys
import json
import urllib.request
import argparse

PORTAL_URL = os.environ.get("Synapse_PORTAL_URL", "http://localhost:3000")

def get_context(node_id=None, project=None, tech=None, agent=None, radius=2):
    """Fetches context from the Brain Portal using POST request with multiple criteria."""
    try:
        url = f"{PORTAL_URL}/api/context/export"
        payload = {
            "id": node_id,
            "project": project,
            "tech": tech,
            "agent": agent,
            "radius": radius,
            "format": "md"
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, 
                                     headers={'Content-Type': 'application/json'}, 
                                     method='POST')
                                     
        with urllib.request.urlopen(req, timeout=5) as response:
            content = response.read().decode('utf-8')
            print(content)
    except Exception as e:
        print(f"Error fetching knowledge: {e}")
        # Fallback
        if os.path.exists("project-context.md"):
            with open("project-context.md", 'r') as f:
                print(f.read())

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Synapse Knowledge Retriever')
    parser.add_argument('--id', help='Node ID (optional)')
    parser.add_argument('--project', help='Project Name context')
    parser.add_argument('--tech', help='Technology context')
    parser.add_argument('--agent', help='Agent context (e.g., Amelia, John)')
    parser.add_argument('--radius', type=int, default=2, help='Relevance radius')
    
    args = parser.parse_args()
    get_context(node_id=args.id, project=args.project, tech=args.tech, agent=args.agent, radius=args.radius)
