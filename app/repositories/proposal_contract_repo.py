from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.proposal_contract import Proposal, Contract

class ProposalRepository(BaseRepository[Proposal, Any, Any]):
    def __init__(self):
        super().__init__(Proposal)

    async def get_by_job_id(self, db: AsyncSession, job_id: Any) -> List[Proposal]:
        result = await db.execute(select(Proposal).filter(Proposal.job_id == job_id))
        return list(result.scalars().all())

    async def get_by_freelancer_id(self, db: AsyncSession, freelancer_id: Any) -> List[Proposal]:
        result = await db.execute(select(Proposal).filter(Proposal.freelancer_id == freelancer_id))
        return list(result.scalars().all())

class ContractRepository(BaseRepository[Contract, Any, Any]):
    def __init__(self):
        super().__init__(Contract)

    async def get_by_job_id(self, db: AsyncSession, job_id: Any) -> Optional[Contract]:
        result = await db.execute(select(Contract).filter(Contract.job_id == job_id))
        return result.scalars().first()

    async def get_by_user_id(self, db: AsyncSession, user_id: Any) -> List[Contract]:
        result = await db.execute(
            select(Contract).filter(
                (Contract.client_id == user_id) | (Contract.freelancer_id == user_id)
            )
        )
        return list(result.scalars().all())

proposal_repo = ProposalRepository()
contract_repo = ContractRepository()
