import os
import sys

# Add the utils directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../scripts/utils/")))
from dispatcher_base import BaseDispatcher

class ProductDispatcher(BaseDispatcher):
    def __init__(self):
        super().__init__("PM Intelligence Dispatcher", "Routes product-related prompts to relevant stages.")

    def analyze_pm_context(self, content):
        keyword_map = {
            "ideation": [r'idea', r'vision', r'brief', r'faq', r'what if', r'brainstorm', r'concept'],
            "definition": [r'prd', r'requirements', r'spec', r'document', r'distill', r'validate prd'],
            "decomposition": [r'epic', r'stor', r'breakdown', r'task list', r'shard', r'story point'],
            "execution": [r'sprint', r'status', r'readiness', r'retro', r'planning', r'kanban']
        }
        return self.match_keywords(content, keyword_map)

    def get_stage_info(self, stage):
        info = {
            "ideation": "Stage 1: Vision, PRFAQ, Brief. Focusing on 'The What and Why'.",
            "definition": "Stage 2: PRD, Requirements, Validation. Focusing on 'The Definition'.",
            "decomposition": "Stage 3: Epics, Stories, Breakdown. Focusing on 'The How'.",
            "execution": "Stage 4: Sprint, Status, Readiness. Focusing on 'The Delivery'."
        }
        return info.get(stage, "Unknown Stage")

    def dispatch(self, prompt):
        selected_stages = self.analyze_pm_context(prompt)
        
        if not selected_stages:
            selected_stages = ["definition"]

        self.report(selected_stages, self.get_stage_info)

if __name__ == "__main__":
    dispatcher = ProductDispatcher()
    dispatcher.run()
