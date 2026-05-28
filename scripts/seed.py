import asyncio
import uuid
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.profile import ClientProfile, FreelancerProfile, Skill
from app.models.job import Job, JobStatus
from app.models.proposal_contract import Proposal, ProposalStatus, Contract, ContractStatus
from app.models.review_notification import Review, Notification

async def clean_database(db: AsyncSession):
    print("Cleaning existing database tables...")
    # Delete in order of dependencies
    await db.execute(delete(Review))
    await db.execute(delete(Notification))
    await db.execute(delete(Contract))
    await db.execute(delete(Proposal))
    await db.execute(delete(Job))
    await db.execute(delete(FreelancerProfile))
    await db.execute(delete(ClientProfile))
    await db.execute(delete(Skill))
    await db.execute(delete(User))
    await db.commit()
    print("Database cleaned.")

async def seed_data():
    async with AsyncSessionLocal() as db:
        await clean_database(db)
        
        print("Seeding skills...")
        skills_names = ["Python", "FastAPI", "React", "Docker", "PostgreSQL", "Redis", "Celery", "Machine Learning", "Tailwind CSS", "TypeScript"]
        skills_map = {}
        for name in skills_names:
            skill = Skill(name=name)
            db.add(skill)
            skills_map[name] = skill
        
        # Commit to generate IDs for skills
        await db.commit()
        for name, skill in skills_map.items():
            await db.refresh(skill)

        print("Seeding admin...")
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            is_active=True,
            is_verified=True
        )
        db.add(admin)

        print("Seeding clients...")
        clients = []
        for i in range(1, 6):
            client = User(
                email=f"client{i}@example.com",
                hashed_password=get_password_hash("ClientPass123!"),
                role="client",
                is_active=True,
                is_verified=True
            )
            db.add(client)
            clients.append(client)

        print("Seeding freelancers...")
        freelancers = []
        for i in range(1, 6):
            freelancer = User(
                email=f"freelancer{i}@example.com",
                hashed_password=get_password_hash("FreelancerPass123!"),
                role="freelancer",
                is_active=True,
                is_verified=True
            )
            db.add(freelancer)
            freelancers.append(freelancer)

        await db.commit()
        for c in clients:
            await db.refresh(c)
        for f in freelancers:
            await db.refresh(f)

        print("Seeding client profiles...")
        client_profiles = []
        companies = [
            ("TechCorp", "Technology", "https://techcorp.com"),
            ("DesignStudio", "Design", "https://designstudio.com"),
            ("FinanceFlow", "Finance", "https://financeflow.com"),
            ("HealthPlus", "Healthcare", "https://healthplus.com"),
            ("EduLearn", "Education", "https://edulearn.com")
        ]
        for idx, client in enumerate(clients):
            comp_name, industry, website = companies[idx]
            profile = ClientProfile(
                user_id=client.id,
                company_name=comp_name,
                industry=industry,
                website=website
            )
            db.add(profile)
            client_profiles.append(profile)

        print("Seeding freelancer profiles...")
        freelancer_profiles = []
        freelancer_details = [
            ("Senior Python Developer", "Specialist in FastAPI, PostgreSQL, and Celery backend systems.", 65.0, ["Python", "FastAPI", "PostgreSQL", "Celery"]),
            ("Frontend React Specialist", "Passionate about rich user interfaces, React, TypeScript, and CSS.", 50.0, ["React", "TypeScript", "Tailwind CSS"]),
            ("Full Stack DevOps Engineer", "Bridging frontend, backend, and deployment using Docker and Redis.", 75.0, ["Python", "React", "Docker", "Redis"]),
            ("Machine Learning Engineer", "Developing predictive models and integrating them with FastAPI.", 90.0, ["Python", "Machine Learning", "FastAPI"]),
            ("UI Developer & Designer", "Stunning visual design converted to perfect Tailwind/React components.", 45.0, ["React", "Tailwind CSS"])
        ]
        for idx, freelancer in enumerate(freelancers):
            title, bio, rate, f_skills = freelancer_details[idx]
            profile_skills = [skills_map[s] for s in f_skills]
            profile = FreelancerProfile(
                user_id=freelancer.id,
                title=title,
                bio=bio,
                hourly_rate=rate,
                portfolio_links=["https://github.com", "https://linkedin.com"],
                skills=profile_skills
            )
            db.add(profile)
            freelancer_profiles.append(profile)

        await db.commit()

        print("Seeding jobs...")
        # Client 1 posts Python Backend Job
        job1 = Job(
            client_id=clients[0].id,
            title="FastAPI Backend Development",
            description="Looking for an experienced backend developer to build a freelance matching system using FastAPI, PostgreSQL, and Celery.",
            budget=2500.0,
            status=JobStatus.OPEN,
            skills=[skills_map["Python"], skills_map["FastAPI"], skills_map["PostgreSQL"], skills_map["Celery"]]
        )
        # Client 2 posts React Landing Page Job
        job2 = Job(
            client_id=clients[1].id,
            title="Modern React Landing Page",
            description="Build a high-performance landing page in React. Highly responsive with premium styling.",
            budget=800.0,
            status=JobStatus.OPEN,
            skills=[skills_map["React"], skills_map["Tailwind CSS"]]
        )
        # Client 3 posts Machine Learning Prediction Job
        job3 = Job(
            client_id=clients[2].id,
            title="ML Recommendation Model",
            description="Build a TF-IDF text similarity recommendation model and deploy it via an API endpoint.",
            budget=4000.0,
            status=JobStatus.OPEN,
            skills=[skills_map["Python"], skills_map["Machine Learning"]]
        )
        # Client 4 posts Dockerization & Deployment Job (Completed Job)
        job4 = Job(
            client_id=clients[3].id,
            title="Docker Compose Setup",
            description="Help us dockerize our current backend app and Redis queue setup.",
            budget=500.0,
            status=JobStatus.COMPLETED,
            skills=[skills_map["Docker"], skills_map["Redis"]]
        )
        # Client 5 posts Draft Job
        job5 = Job(
            client_id=clients[4].id,
            title="Future Web Project",
            description="This is a draft project description for future reference.",
            budget=1200.0,
            status=JobStatus.DRAFT,
            skills=[skills_map["React"], skills_map["TypeScript"]]
        )
        db.add_all([job1, job2, job3, job4, job5])
        await db.commit()
        await db.refresh(job1)
        await db.refresh(job2)
        await db.refresh(job3)
        await db.refresh(job4)
        await db.refresh(job5)

        print("Seeding proposals...")
        # Freelancer 1 (Python) bids on Job 1
        prop1 = Proposal(
            job_id=job1.id,
            freelancer_id=freelancers[0].id,
            rate=60.0,
            cover_letter="I have extensive FastAPI and Celery experience. Happy to help you build this system.",
            status=ProposalStatus.PENDING
        )
        # Freelancer 3 (Full Stack) bids on Job 1
        prop2 = Proposal(
            job_id=job1.id,
            freelancer_id=freelancers[2].id,
            rate=70.0,
            cover_letter="Full stack engineer here. I can handle the backend and the Docker deployment.",
            status=ProposalStatus.PENDING
        )
        # Freelancer 2 (React Specialist) bids on Job 2
        prop3 = Proposal(
            job_id=job2.id,
            freelancer_id=freelancers[1].id,
            rate=45.0,
            cover_letter="I specialize in React and Tailwind. I will make a premium wow-worthy design.",
            status=ProposalStatus.PENDING
        )
        # Freelancer 5 (UI Developer) bids on Job 2
        prop4 = Proposal(
            job_id=job2.id,
            freelancer_id=freelancers[4].id,
            rate=45.0,
            cover_letter="UI/UX is my passion. Will deliver interactive micro-animations.",
            status=ProposalStatus.PENDING
        )
        # Freelancer 4 (ML) bids on Job 3
        prop5 = Proposal(
            job_id=job3.id,
            freelancer_id=freelancers[3].id,
            rate=90.0,
            cover_letter="I build recommendation systems every day. Let's get started.",
            status=ProposalStatus.PENDING
        )
        # Freelancer 3 (Full Stack) bid on Job 4 (Accepted for the completed job)
        prop6 = Proposal(
            job_id=job4.id,
            freelancer_id=freelancers[2].id,
            rate=500.0,
            cover_letter="Docker setup is quick and easy. I can finish it within a day.",
            status=ProposalStatus.ACCEPTED
        )
        db.add_all([prop1, prop2, prop3, prop4, prop5, prop6])
        await db.commit()
        await db.refresh(prop6)

        print("Seeding contracts...")
        # Create a completed contract for Job 4
        contract = Contract(
            job_id=job4.id,
            client_id=clients[3].id,
            freelancer_id=freelancers[2].id,
            proposal_id=prop6.id,
            budget=500.0,
            status=ContractStatus.COMPLETED,
            start_date=datetime.datetime.now() - datetime.timedelta(days=5),
            end_date=datetime.datetime.now()
        )
        # Update Job 4 with the freelancer_id
        job4.freelancer_id = freelancers[2].id
        db.add(job4)
        db.add(contract)
        await db.commit()
        await db.refresh(contract)

        print("Seeding reviews...")
        # Client 4 reviews Freelancer 3
        review_client = Review(
            contract_id=contract.id,
            reviewer_id=clients[3].id,
            reviewee_id=freelancers[2].id,
            rating=5,
            comment="Excellent work dockerizing our environment. Fast and high quality!"
        )
        # Freelancer 3 reviews Client 4
        review_freelancer = Review(
            contract_id=contract.id,
            reviewer_id=freelancers[2].id,
            reviewee_id=clients[3].id,
            rating=5,
            comment="Great client! Clear requirements and prompt communication."
        )
        db.add_all([review_client, review_freelancer])
        await db.commit()

        print("Seeding notifications...")
        notif1 = Notification(
            user_id=freelancers[0].id,
            title="New Job Match",
            message="A new job matching your skill 'FastAPI' has been posted.",
            is_read=False
        )
        notif2 = Notification(
            user_id=clients[0].id,
            title="New Proposal",
            message="You received a new proposal for your job 'FastAPI Backend Development'.",
            is_read=True
        )
        db.add_all([notif1, notif2])
        await db.commit()

        print("Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
