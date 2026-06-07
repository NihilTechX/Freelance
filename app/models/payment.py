import uuid
import enum
from datetime import datetime
from sqlalchemy import String, ForeignKey, Numeric, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    HELD_IN_ESCROW = "held_in_escrow"
    RELEASED = "released"
    REFUNDED = "refunded"

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stripe_payment_intent_id: Mapped[str] = mapped_column(String(255), nullable=True) # Set when Stripe session completes
    status: Mapped[PaymentStatus] = mapped_column(String(50), default=PaymentStatus.PENDING, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    contract = relationship("Contract")
