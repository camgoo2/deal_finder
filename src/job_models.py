from typing import Optional
from datetime import date
from pydantic import BaseModel,Field # type: ignore

class DealFinderJob(BaseModel):
    promotion_start_date: Optional[date] = Field(default=None, description="The start date of the promotion")
    promotion_end_date: Optional[date] = Field(
        default="", description="The end date of the promotion"
    )
    business_name: Optional[str] = Field(default="", description="The business providing the promotion")
    web_address: Optional[str] = Field(default="", description="The web address for the promotion")
    discount_percentage: Optional[float] = Field(
        default="", description="The discount of the promotion"
    )


# Request Body Model
class JobRequest(BaseModel):
    email_text: str
