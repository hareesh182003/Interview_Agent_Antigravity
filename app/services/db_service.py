import uuid
from typing import Dict, Any, Optional
from datetime import datetime

# In-memory storage for MVP
# Structure: { candidate_id: { ...data } }
candidates_db: Dict[str, Any] = {}

class DatabaseService:
    def save_candidate(self, resume_text: str, ats_result: dict) -> str:
        """
        Saves a candidate's resume and initial ATS result.
        Returns the new candidate_id.
        """
        candidate_id = str(uuid.uuid4())
        
        # Determine Status
        is_qualified = ats_result.get("match_percentage", 0) >= 75
        status = "QUALIFIED" if is_qualified else "REJECTED"
        
        record = {
            "id": candidate_id,
            "resume_text": resume_text,
            "ats_score": ats_result.get("match_percentage", 0),
            "ats_data": ats_result,
            "status": status,
            "created_at": datetime.utcnow().isoformat(),
            "interview_session_id": None # Will be linked later
        }
        
        candidates_db[candidate_id] = record
        print(f"DEBUG: Saved candidate {candidate_id} - Status: {status}")
        return candidate_id

    def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        return candidates_db.get(candidate_id)

    def link_interview_session(self, candidate_id: str, session_id: str):
        if candidate_id in candidates_db:
            candidates_db[candidate_id]["interview_session_id"] = session_id

db_service = DatabaseService()
