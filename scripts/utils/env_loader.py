import os

def load_env():
    """
    Search up the directory tree starting from this script's directory
    to locate and parse the project's .env file, populating os.environ.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    while current_dir != os.path.dirname(current_dir):  # Stop at root directory
        env_path = os.path.join(current_dir, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, val = line.split("=", 1)
                        # Remove quotes if present
                        val = val.strip().strip("'\"")
                        # Only set if not already set in the environment
                        if key.strip() not in os.environ:
                            os.environ[key.strip()] = val.strip()
            break
        current_dir = os.path.dirname(current_dir)

SAFE_KEYS = [
    "SYNAPSE_USER_NAME",
    "SYNAPSE_COMMUNICATION_LANGUAGE",
    "SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE",
    "SYNAPSE_OUTPUT_FOLDER",
    "SYNAPSE_PORTAL_PORT",
    "SYNAPSE_PROJECT_KNOWLEDGE"
]

if __name__ == "__main__":
    load_env()
    for key in SAFE_KEYS:
        val = os.getenv(key)
        if val is not None:
            print(f"{key}={val}")
