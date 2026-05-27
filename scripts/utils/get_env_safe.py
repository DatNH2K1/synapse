from pathlib import Path
import sys
import os

# Add project root directory to sys.path
sys.path.append(str(Path(__file__).parents[2]))

from scripts.utils.env_loader import load_env
load_env()

SAFE_KEYS = [
    "SYNAPSE_USER_NAME",
    "SYNAPSE_COMMUNICATION_LANGUAGE",
    "SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE",
    "SYNAPSE_OUTPUT_FOLDER",
    "SYNAPSE_PORTAL_PORT",
    "SYNAPSE_PROJECT_KNOWLEDGE"
]

for key in SAFE_KEYS:
    val = os.getenv(key)
    if val is not None:
        print(f"{key}={val}")
