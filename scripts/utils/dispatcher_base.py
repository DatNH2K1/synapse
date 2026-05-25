import re
import sys
import json
import logging
import os

class BaseDispatcher:
    def __init__(self, name, description):
        self.name = name
        self.description = description
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(self.name)

    def match_keywords(self, content, keyword_map):
        """
        Matches content against a map of layer_name -> list of regex patterns.
        Returns a list of matched layer names.
        """
        matched_layers = []
        for layer, patterns in keyword_map.items():
            if any(re.search(p, content, re.IGNORECASE) for p in patterns):
                matched_layers.append(layer)
        return list(set(matched_layers))

    def run(self):
        if len(sys.argv) < 2:
            self.logger.error("No prompt provided.")
            print(f"Usage: python3 {sys.argv[0]} <prompt_text>")
            sys.exit(1)

        prompt = sys.argv[1]
        try:
            self.dispatch(prompt)
        except Exception as e:
            self.logger.error(f"Dispatch failed: {str(e)}", exc_info=True)
            print(f"### Error in {self.name}")
            print(f"Details: {str(e)}")
            sys.exit(1)

    def dispatch(self, prompt):
        """Override this in subclasses"""
        raise NotImplementedError("Subclasses must implement dispatch()")

    def get_context_path(self):
        # Locate the workspace root directory from the current file
        # file is in scripts/utils/
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
        context_path = os.path.join(base_dir, "memory", "session-context.json")
        os.makedirs(os.path.dirname(context_path), exist_ok=True)
        return context_path

    def load_context(self):
        path = self.get_context_path()
        session_ttl = 3600  # 60 minutes in seconds
        
        if os.path.exists(path):
            # Check if session is stale
            mtime = os.path.getmtime(path)
            import time
            if time.time() - mtime > session_ttl:
                self.logger.info(f"Session stale (> {session_ttl}s). Clearing context.")
                return {"session_id": "default", "history": [], "shared_data": {}}
                
            with open(path, 'r') as f:
                return json.load(f)
        return {"session_id": "default", "history": [], "shared_data": {}}

    def save_context(self, data):
        path = self.get_context_path()
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

    def update_shared_data(self, key, value):
        context = self.load_context()
        context["shared_data"][key] = value
        context["history"].append({
            "agent": self.name,
            "action": f"Updated {key}",
            "value": value,
            "timestamp": os.path.getmtime(self.get_context_path()) if os.path.exists(self.get_context_path()) else 0
        })
        self.save_context(context)

    def register_action(self, action_name, command):
        """Register an interactive action that can be triggered from the dashboard"""
        context = self.load_context()
        if "actions" not in context:
            context["actions"] = {}
        context["actions"][action_name] = {
            "command": command,
            "status": "idle",
            "last_run": None
        }
        self.save_context(context)

    def fallback(self, error_msg, suggestion):
        self.logger.warning(f"Recovery Triggered: {error_msg}")
        print(f"\n⚠️ **Recovery Strategy Activated**")
        print(f"Issue: {error_msg}")
        print(f"Suggestion: {suggestion}")
        print("---")

    def report(self, selected_items, info_callback=None):
        print(f"### {self.name} Report")
        print(f"Detected intention for: {', '.join(selected_items)}")
        
        # Save to context
        self.update_shared_data(f"{self.name}_detected", selected_items)
        
        if info_callback:
            print("\nAutomatically activating the following layers:")
            for item in selected_items:
                print(f"- **{item.capitalize()}**: {info_callback(item)}")
        print("\n---")
