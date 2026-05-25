import os
import sys

# Add the utils directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../scripts/utils/")))
from dispatcher_base import BaseDispatcher

class ResearchDispatcher(BaseDispatcher):
    def __init__(self):
        super().__init__("Research Intelligence Dispatcher", "Routes research queries to relevant analysis layers.")

    def analyze_research_context(self, content):
        keyword_map = {
            "domain-analysis": [r'industry', r'domain', r'market', r'competitor', r'business model', r'sector'],
            "technical-deep-dive": [r'technical', r'architecture', r'framework', r'library', r'benchmark', r'stack', r'performance'],
            "docs-lookup": [r'docs', r'api', r'syntax', r'lookup', r'how to', r'documentation']
        }
        return self.match_keywords(content, keyword_map)

    def dispatch(self, prompt):
        selected = self.analyze_research_context(prompt)
        if not selected:
            selected = ["domain-analysis"]
        self.report(selected)

if __name__ == "__main__":
    dispatcher = ResearchDispatcher()
    dispatcher.run()
