import os
import sys

# Add the utils directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../scripts/utils/")))
from dispatcher_base import BaseDispatcher

class CoreDispatcher(BaseDispatcher):
    def __init__(self):
        super().__init__("Core System Dispatcher", "Routes administrative and system management tasks.")

    def analyze_core_context(self, content):
        keyword_map = {
            "project-admin": [r'project', r'register', r'roots', r'config', r'help', r'synapse'],
            "memory-management": [r'memory', r'lessons', r'learned', r'update', r'persist'],
            "context-engineering": [r'context', r'tokens', r'usage', r'optimization', r'limits']
        }
        return self.match_keywords(content, keyword_map)

    def dispatch(self, prompt):
        selected = self.analyze_core_context(prompt)
        if not selected:
            selected = ["project-admin"]
        self.report(selected)

if __name__ == "__main__":
    dispatcher = CoreDispatcher()
    dispatcher.run()
