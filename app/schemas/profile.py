from pydantic import BaseModel, Field
import uuid
from typing import List, Optional

class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class ClientProfileBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    industry: Optional[str] = None
    website: Optional[str] = None

class ClientProfileCreate(ClientProfileBase):
    pass

class ClientProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    industry: Optional[str] = None
    website: Optional[str] = None

class ClientProfileResponse(ClientProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID

    class Config:
        from_attributes = True

class FreelancerProfileBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    bio: str = Field(..., min_length=1, max_length=5000)
    hourly_rate: float = Field(..., ge=0, description="Hourly rate in USD; must be non-negative")
    portfolio_links: Optional[List[str]] = None

class FreelancerProfileCreate(FreelancerProfileBase):
    skills: List[str]  # List of skill names

class FreelancerProfileUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    bio: Optional[str] = Field(None, min_length=1, max_length=5000)
    hourly_rate: Optional[float] = Field(None, ge=0)
    portfolio_links: Optional[List[str]] = None
    skills: Optional[List[str]] = None  # List of skill names to associate

class FreelancerProfileResponse(FreelancerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True
