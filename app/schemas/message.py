from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from app.schemas.auth import UserResponse

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    contract_id: uuid.UUID

class MessageResponse(MessageBase):
    id: uuid.UUID
    contract_id: uuid.UUID
    sender_id: uuid.UUID
    is_read: bool
    created_at: datetime
    sender: Optional[UserResponse] = None

    model_config = {
        "from_attributes": True
    }
