import uuid
from sqlalchemy import String, Numeric, ForeignKey, Table, Column, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

# Association table for Freelancer <-> Skill M2M
freelancer_skills = Table(
    "freelancer_skills",
    Base.metadata,
    Column("freelancer_profile_id", UUID(as_uuid=True), ForeignKey("freelancer_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    freelancers = relationship("FreelancerProfile", secondary=freelancer_skills, back_populates="skills")

class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(100), nullable=True)
    website: Mapped[str] = mapped_column(String(255), nullable=True)

    user = relationship("User", back_populates="client_profile")

class FreelancerProfile(Base):
    __tablename__ = "freelancer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    hourly_rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    portfolio_links: Mapped[list] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="freelancer_profile")
    skills = relationship("Skill", secondary=freelancer_skills, back_populates="freelancers")
