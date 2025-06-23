from src.job_models import DealFinderJob

SYSTEM_PROMPT = f"""
Extract promotion details from the provided email. The response **must strictly follow** the JSON format below:

{DealFinderJob.model_json_schema()}

Ensure that:
- All field names match exactly.
- No additional fields are added.
- If a field is not present in the email, return an empty string.

Output the JSON **without any extra formatting** like triple backticks.
"""
