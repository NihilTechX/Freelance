from pydantic import BaseModel, Field
import uuid
from datetime import datetime
from typing import List, Optional
from app.models.job import JobStatus
from app.schemas.profile import SkillResponse

class JobBase(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=10)
    budget: float = Field(gt=0, description="Budget must be greater than zero")

class JobCreate(JobBase):
    skills: List[str] = []  # List of required skill names

class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    budget: Optional[float] = Field(None, gt=0)
    skills: Optional[List[str]] = None

class JobResponse(JobBase):
    id: uuid.UUID
    client_id: uuid.UUID
    freelancer_id: Optional[uuid.UUID] = None
    status: JobStatus
    created_at: datetime
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True
