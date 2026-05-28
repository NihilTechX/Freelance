from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.repositories.job_repo import job_repo
from app.repositories.profile_repo import freelancer_profile_repo
from app.models.job import Job
from app.models.profile import FreelancerProfile
from app.schemas.matching import FreelancerMatchResponse, MatchBreakdown
from app.core.exceptions import NotFoundException

class MatchingService:
    async def get_matches_for_job(self, db: AsyncSession, job_id: Any) -> List[FreelancerMatchResponse]:
        # 1. Fetch the target job
        job = await job_repo.get_with_skills(db, job_id)
        if not job:
            raise NotFoundException("Job not found")

        # 2. Fetch all freelancer profiles
        freelancers = await freelancer_profile_repo.get_all_with_relations(db)
        if not freelancers:
            return []

        # Filter out profiles with missing/empty required fields
        # (can happen if records pre-date schema validation being added)
        freelancers = [
            f for f in freelancers
            if f.title and f.title.strip() and f.bio and f.bio.strip()
        ]
        if not freelancers:
            return []

        # 3. Calculate textual similarity using TF-IDF and Cosine Similarity
        # Job text: title + description + required skills name
        job_skills_text = " ".join([s.name for s in job.skills])
        job_text = f"{job.title} {job.description} {job_skills_text}"

        # Freelancer texts: title + bio + skills names
        freelancer_texts = []
        for f in freelancers:
            f_skills_text = " ".join([s.name for s in f.skills])
            freelancer_texts.append(f"{f.title} {f.bio} {f_skills_text}")

        # Combine corpus for TF-IDF vectorization
        corpus = freelancer_texts + [job_text]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)

        # The last row in the matrix is the job vector, rows 0 to len(freelancers)-1 are freelancers
        job_vector = tfidf_matrix[-1]
        freelancer_vectors = tfidf_matrix[:-1]

        # Calculate cosine similarities
        similarities = cosine_similarity(freelancer_vectors, job_vector).flatten()

        # 4. Calculate Jaccard and Budget matches and combine scores
        job_skills_set = {s.name.lower().strip() for s in job.skills}
        
        results = []
        for i, f in enumerate(freelancers):
            text_score = float(similarities[i])

            # Jaccard Skill Overlap
            f_skills_set = {s.name.lower().strip() for s in f.skills}
            intersection = job_skills_set.intersection(f_skills_set)
            union = job_skills_set.union(f_skills_set)
            skill_score = len(intersection) / len(union) if union else 0.0

            # Budget Compatibility
            # Assume 20 hours estimated project duration
            estimated_cost = float(f.hourly_rate) * 20.0
            job_budget = float(job.budget)
            budget_score = 1.0 if estimated_cost <= job_budget else job_budget / estimated_cost

            # Combined score: 40% Text, 40% Skill, 20% Budget
            overall_score = 0.4 * text_score + 0.4 * skill_score + 0.2 * budget_score

            breakdown = MatchBreakdown(
                text_similarity=round(text_score, 4),
                skill_match=round(skill_score, 4),
                budget_fit=round(budget_score, 4),
                overall_score=round(overall_score, 4)
            )

            results.append(FreelancerMatchResponse(
                freelancer=f,
                match_score=round(overall_score, 4),
                breakdown=breakdown
            ))

        # Sort recommendations descending by match_score
        results.sort(key=lambda x: x.match_score, reverse=True)

        return results

matching_service = MatchingService()
