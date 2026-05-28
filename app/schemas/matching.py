from pydantic import BaseModel
import uuid
from typing import List
from app.schemas.profile import FreelancerProfileResponse

class MatchBreakdown(BaseModel):
    text_similarity: float
    skill_match: float
    budget_fit: float
    overall_score: float

class FreelancerMatchResponse(BaseModel):
    freelancer: FreelancerProfileResponse
    match_score: float
    breakdown: MatchBreakdown
