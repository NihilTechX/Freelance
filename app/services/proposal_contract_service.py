from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
from datetime import datetime, timezone

from app.repositories.proposal_contract_repo import proposal_repo, contract_repo
from app.repositories.job_repo import job_repo
from app.models.proposal_contract import Proposal, Contract, ProposalStatus, ContractStatus
from app.models.job import JobStatus
from app.schemas.proposal_contract import ProposalCreate, ProposalUpdate, ContractCreate, ContractUpdate
from app.core.exceptions import BadRequestException, NotFoundException, ForbiddenException

class ProposalService:
    async def get_proposal(self, db: AsyncSession, proposal_id: Any) -> Proposal:
        proposal = await proposal_repo.get(db, proposal_id)
        if not proposal:
            raise NotFoundException("Proposal not found")
        return proposal

    async def list_proposals_by_job(self, db: AsyncSession, client_id: Any, job_id: Any) -> List[Proposal]:
        # Verify job ownership
        job = await job_repo.get(db, job_id)
        if not job:
            raise NotFoundException("Job not found")
        if job.client_id != client_id:
            raise ForbiddenException("Not authorized to view proposals for this job")
            
        return await proposal_repo.get_by_job_id(db, job_id)

    async def list_my_proposals(self, db: AsyncSession, freelancer_id: Any) -> List[Proposal]:
        return await proposal_repo.get_by_freelancer_id(db, freelancer_id)

    async def create_proposal(self, db: AsyncSession, freelancer_id: Any, proposal_in: ProposalCreate) -> Proposal:
        job = await job_repo.get_with_skills(db, proposal_in.job_id)
        if not job:
            raise NotFoundException("Job not found")

        # Business check: Job must be open
        if job.status != JobStatus.OPEN:
            raise BadRequestException("Can only apply to open jobs")

        # Business check: Cannot apply twice
        existing_proposals = await proposal_repo.get_by_job_id(db, job.id)
        for p in existing_proposals:
            if p.freelancer_id == freelancer_id:
                raise BadRequestException("Already submitted a proposal for this job")

        proposal_data = proposal_in.model_dump()
        proposal_data["freelancer_id"] = freelancer_id
        proposal_data["status"] = ProposalStatus.PENDING

        return await proposal_repo.create(db, proposal_data)

class ContractService:
    async def get_contract(self, db: AsyncSession, contract_id: Any) -> Contract:
        contract = await contract_repo.get(db, contract_id)
        if not contract:
            raise NotFoundException("Contract not found")
        return contract

    async def list_my_contracts(self, db: AsyncSession, user_id: Any) -> List[Contract]:
        return await contract_repo.get_by_user_id(db, user_id)

    async def create_contract(self, db: AsyncSession, client_id: Any, contract_in: ContractCreate) -> Contract:
        proposal = await proposal_repo.get(db, contract_in.proposal_id)
        if not proposal:
            raise NotFoundException("Proposal not found")

        if proposal.status != ProposalStatus.PENDING:
            raise BadRequestException("Can only accept pending proposals")

        job = await job_repo.get_with_skills(db, proposal.job_id)
        if not job:
            raise NotFoundException("Job not found")

        # Verify client is job owner
        if job.client_id != client_id:
            raise ForbiddenException("Not authorized to accept proposals for this job")

        # Verify job is open
        if job.status != JobStatus.OPEN:
            raise BadRequestException("Job is no longer open for hiring")

        # Accept this proposal
        proposal.status = ProposalStatus.ACCEPTED
        db.add(proposal)

        # Reject all other pending proposals for this job
        all_proposals = await proposal_repo.get_by_job_id(db, job.id)
        for p in all_proposals:
            if p.id != proposal.id and p.status == ProposalStatus.PENDING:
                p.status = ProposalStatus.REJECTED
                db.add(p)

        # Create contract
        contract_data = {
            "job_id": job.id,
            "client_id": client_id,
            "freelancer_id": proposal.freelancer_id,
            "proposal_id": proposal.id,
            "budget": proposal.rate,
            "status": ContractStatus.ACTIVE
        }
        db_contract = await contract_repo.create(db, contract_data)

        # Update job to IN_PROGRESS and assign freelancer
        job.status = JobStatus.IN_PROGRESS
        job.freelancer_id = proposal.freelancer_id
        db.add(job)

        await db.commit()
        await db.refresh(db_contract)

        return db_contract

    async def complete_or_cancel_contract(self, db: AsyncSession, user_id: Any, contract_id: Any, status_in: ContractStatus) -> Contract:
        contract = await self.get_contract(db, contract_id)

        # Verify caller is party to the contract
        if contract.client_id != user_id and contract.freelancer_id != user_id:
            raise ForbiddenException("Not authorized to modify this contract")

        # Only the client can mark a contract COMPLETED
        if status_in == ContractStatus.COMPLETED and contract.client_id != user_id:
            raise ForbiddenException("Only the client can mark a contract as completed")

        if contract.status != ContractStatus.ACTIVE:
            raise BadRequestException("Contract is already completed or cancelled")

        # Update contract
        contract.status = status_in
        contract.end_date = datetime.now(timezone.utc)
        db.add(contract)

        # Sync job status
        job = await job_repo.get_with_skills(db, contract.job_id)
        if job:
            if status_in == ContractStatus.COMPLETED:
                job.status = JobStatus.COMPLETED
            elif status_in == ContractStatus.CANCELLED:
                job.status = JobStatus.CANCELLED
            db.add(job)

        await db.commit()
        await db.refresh(contract)
        return contract

proposal_service = ProposalService()
contract_service = ContractService()
