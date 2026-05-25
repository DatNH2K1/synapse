import os
import sys

# Add the utils directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../scripts/utils/")))
from dispatcher_base import BaseDispatcher

class DesignDispatcher(BaseDispatcher):
    def __init__(self):
        super().__init__("Design Intelligence Dispatcher", "Routes design queries to relevant UX/UI layers.")

    def analyze_design_context(self, content):
        keyword_map = {
            "ux-strategy": [r'ux', r'wireframe', r'sitemap', r'user flow', r'accessibility', r'strategy', r'research'],
            "visual-creative": [r'image', r'logo', r'icon', r'color', r'palette', r'typography', r'artist', r'stitch', r'visual'],
            "frontend-architecture": [r'react', r'component', r'css', r'html', r'tailwind', r'code', r'frontend', r'layout']
        }
        return self.match_keywords(content, keyword_map)

    def get_layer_info(self, layer):
        info = {
            "ux-strategy": "Layer 1: UX Strategy & Planning. Focusing on 'How it works and feels'.",
            "visual-creative": "Layer 2: Visual & Creative Design. Focusing on 'How it looks'.",
            "frontend-architecture": "Layer 3: Frontend Architecture. Focusing on 'How it is built'."
        }
        return info.get(layer, "Unknown Layer")

    def dispatch(self, prompt):
        selected_layers = self.analyze_design_context(prompt)
        
        if not selected_layers:
            selected_layers = ["ux-strategy", "visual-creative"]

        self.report(selected_layers, self.get_layer_info)

if __name__ == "__main__":
    dispatcher = DesignDispatcher()
    dispatcher.run()
