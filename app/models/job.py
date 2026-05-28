import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Table, Column, Text, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Association table for Job <-> Skill M2M
job_skills = Table(
    "job_skills",
    Base.metadata,
    Column("job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[JobStatus] = mapped_column(String(20), default=JobStatus.DRAFT, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=datetime.utcnow)

    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="posted_jobs")
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="hired_jobs")
    skills = relationship("Skill", secondary=job_skills)
    proposals = relationship("Proposal", back_populates="job", cascade="all, delete-orphan")
    contract = relationship("Contract", uselist=False, back_populates="job", cascade="all, delete-orphan")
