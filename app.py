from fastapi import FastAPI  # type: ignore
from fastapi import Header
from fastapi import HTTPException
from openai import OpenAI  # type: ignore

from src.job_models import JobRequest
from src.job_models import DealFinderJob
from src.prompts import SYSTEM_PROMPT

app = FastAPI()


# API Endpoint
@app.post("/extract-job-details", response_model=DealFinderJob)
async def extract_job_details(
    request: JobRequest, x_api_key: str = Header(...)
) -> DealFinderJob:
    try:
        client = OpenAI(api_key=x_api_key, base_url="https://api.x.ai/v1")

        completion = client.beta.chat.completions.parse(
            model="grok-2-latest",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.email_text},
            ],
        )
        print(completion)
        raw_json = completion.choices[0].message.content

        cleaned_json = raw_json.strip().replace("```json", "").replace("```", "")

        deal_finder_job = DealFinderJob.model_validate_json(
            cleaned_json
        )  # Parse JSON response into DealFinderJob model
        return deal_finder_job

    except Exception as e:
        raise HTTPException(500, f"Error extracting job details: {str(e)}")
