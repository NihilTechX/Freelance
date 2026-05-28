import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Text, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class ProposalStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ContractStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Proposal(Base):
    __tablename__ = "proposals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    cover_letter: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ProposalStatus] = mapped_column(String(20), default=ProposalStatus.PENDING, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    job = relationship("Job", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals")
    contract = relationship("Contract", uselist=False, back_populates="proposal")

class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    proposal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proposals.id", ondelete="CASCADE"), unique=True, nullable=False)

    budget: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[ContractStatus] = mapped_column(String(20), default=ContractStatus.ACTIVE, nullable=False)

    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    job = relationship("Job", back_populates="contract")
    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])
    proposal = relationship("Proposal", back_populates="contract")
