import os

agent_dir = "/Users/user004/Documents/synapse/.agent"

old_block_1 = """1. Load config from `.env` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning"""

old_block_2 = """1. Load config from `.env` and resolve::
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning"""

old_block_3 = """Load config from `.env` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning"""

new_block = """1. Load config from environment variables in `.env` and resolve:
   - Use `SYNAPSE_USER_NAME` (resolving `{user_name}`) for greeting
   - Use `SYNAPSE_COMMUNICATION_LANGUAGE` (resolving `{communication_language}`) for all communications
   - Use `SYNAPSE_DOCUMENT_OUTPUT_LANGUAGE` (resolving `{document_output_language}`) for output documents
   - Use `SYNAPSE_OUTPUT_FOLDER` (resolving `{planning_artifacts}` and `{output_folder}`) for output location and artifact scanning
   - Use `SYNAPSE_PROJECT_KNOWLEDGE` (resolving `{project_knowledge}`) for additional context scanning"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original = content
    
    content = content.replace(old_block_1, new_block)
    content = content.replace(old_block_2, new_block)
    content = content.replace(old_block_3, new_block)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(agent_dir):
    for file in files:
        if file.endswith(('.md', '.csv', '.json', '.txt')):
            process_file(os.path.join(root, file))
