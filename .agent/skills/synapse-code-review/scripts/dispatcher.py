import os
import sys

# Add the utils directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../scripts/utils/")))
from dispatcher_base import BaseDispatcher

class CodeReviewDispatcher(BaseDispatcher):
    def __init__(self):
        super().__init__("Code Review Dispatcher", "Routes code review tasks to specialized audit layers.")

    def analyze_context(self, content):
        keyword_map = {
            "edge-case": [r'if\s*\(', r'else', r'switch', r'for\s*\(', r'while\s*\(', r'map\(', r'filter\(', r'\+', r'\-', r'\*', r'\/'],
            "prose-ui": [r'className=', r'style=', r'<div', r'display:', r'color:', r'flex', r'grid'],
            "security": [r'password', r'token', r'secret', r'apiKey', r'jwt', r'sql', r'encrypt', r'decrypt', r'auth']
        }
        layers = self.match_keywords(content, keyword_map)
        layers.append("adversarial") # Default layer
        return list(set(layers))

    def get_layer_instructions(self, layer):
        instructions = {
            "adversarial": "Role: Cynical Reviewer. Goal: Find flaws, missing logic, and sloppy work. Tone: Skeptical.",
            "edge-case": "Role: Path Tracer. Goal: Identify unhandled boundary conditions, nulls, empty states, and race conditions. No editorializing.",
            "prose-ui": "Role: UX Advocate. Goal: Check for naming clarity, UI consistency, accessibility gaps, and user-facing copy issues.",
            "security": "Role: Security Auditor. Goal: Find potential vulnerabilities (XSS, SQLi, broken auth, sensitive data exposure)."
        }
        return instructions.get(layer, "")

    def dispatch(self, input_val):
        # In this dispatcher, input_val is either a prompt or a file path
        content = input_val
        if os.path.exists(input_val):
            with open(input_val, 'r') as f:
                content = f.read()
        
        selected_layers = self.analyze_context(content)
        self.report(selected_layers, self.get_layer_instructions)

if __name__ == "__main__":
    dispatcher = CodeReviewDispatcher()
    dispatcher.run()
