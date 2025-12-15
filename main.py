from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import io
import uuid
import base64
import json
import traceback

# Load environment variables
load_dotenv()

from app.services.voice_service import voice_service
from app.services.storage_service import storage_service
from app.agents.graph import graph
from app.agents.state import InterviewState

# Enterprise Services
from app.services.token_service import token_service
from app.services.db_service import db_service

app = FastAPI(title="Interview Bot Agent", description="Voice-enabled Interview Bot with LangGraph Agents")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Scheme
security = HTTPBearer()

# In-memory session storage (In production, use Redis or DB)
sessions = {}

class StartInterviewResponse(BaseModel):
    session_id: str
    message: str
    audio_base64: str

class InitInterviewResponse(BaseModel):
    session_id: str
    message: str
    audio_base64: str

class ChatResponse(BaseModel):
    message: str
    audio_base64: str
    status: str # "active" or "completed"

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Interview Bot Backend"}

# Helper for background resume parsing (kept for legacy/internal use if needed, but not used by new flow)
def process_resume_background(session_id: str, content: bytes):
    try:
        print(f"DEBUG: Starting background resume processing for {session_id}")
        import io
        from pypdf import PdfReader
        resume_text = ""
        reader = PdfReader(io.BytesIO(content))
        for page in reader.pages:
            resume_text += page.extract_text() + "\n"
        
        # Update session with parsed text
        if session_id in sessions:
            sessions[session_id]["resume_text"] = resume_text
            print(f"DEBUG: Background resume processing complete. Length: {len(resume_text)}")
    except Exception as e:
        print(f"Error in background resume parsing: {e}")

# --- Enterprise Endpoints ---

@app.post("/interview/init", response_model=InitInterviewResponse)
async def init_interview_session(
    background_tasks: BackgroundTasks,
    tokens: HTTPAuthorizationCredentials = Security(security)
):
    """
    Securely initializes an interview session using a valid Admission Token.
    """
    # 1. Verify Token
    token = tokens.credentials
    payload = token_service.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired admission token")
        
    candidate_id = payload.get("sub")
    
    # 2. Retrieve Candidate Data
    candidate = db_service.get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate data not found")
        
    resume_text = candidate.get("resume_text", "")
    
    # 3. Create Session
    session_id = str(uuid.uuid4())
    db_service.link_interview_session(candidate_id, session_id)
    
    initial_message = "Hello! I have reviewed your resume. I am your interviewer today. Are you ready to begin?"
    
    sessions[session_id] = {
        "messages": [{"role": "assistant", "content": initial_message}],
        "question_count": 0,
        "next_node": "interviewer",
        "resume_text": resume_text,
        "candidate_id": candidate_id
    }
    
    print(f"DEBUG: Initialized secure session {session_id} for candidate {candidate_id}")

    # 4. Generate Audio (Cached/Fresh)
    CACHE_FILE = "intro_audio.cache"
    audio_bytes = None
    
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "rb") as f:
                audio_bytes = f.read()
        except:
            pass
            
    if not audio_bytes:
        audio_bytes = voice_service.speak_text(initial_message)
        try:
            with open(CACHE_FILE, "wb") as f:
                f.write(audio_bytes)
        except:
            pass

    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    return {
        "session_id": session_id,
        "message": initial_message,
        "audio_base64": audio_b64
    }

# The original /interview/start endpoint is removed as /interview/init takes over its role in the secure flow.
# If a non-secure flow is still desired, this endpoint would need to be re-added and potentially modified.

@app.post("/interview/chat")
async def chat(
    session_id: str = Form(...),
    audio_file: UploadFile = File(None),
    text_input: str = Form(None)
):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_state = sessions[session_id]
    user_text = ""

    # 1. Handle Input (Audio or Text)
    if audio_file:
        content = await audio_file.read()
        if content:
             # Transcribe
             user_text = voice_service.transcribe_audio(content)
             print(f"Transcribed: {user_text}")
    elif text_input:
        user_text = text_input
    
    if user_text:
        current_state['messages'].append({"role": "user", "content": user_text})
    
    # 2. Run Graph (Assumption: Correctly configured to run one turn)
    # For now, let's assume I fix `graph.py` in the next tool call. I'll write the API code assuming `graph` will handle it correctly (run one step).
    # Actually, `app/agents/graph.py` is imported. I can just re-import or use `graph` object.
    
    # Let's just execute the graph. 
    # If the graph loops, we have a problem.
    # I will handle this by editing `graph.py` concurrently or right after.
    
    # Let's assume I will fix the graph.
    
    result = graph.invoke(current_state)
    
    # Update local state
    sessions[session_id] = result
    
    # Get last message
    last_message = result['messages'][-1]['content']
    
    # Audio response
    audio_bytes = voice_service.speak_text(last_message)
    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    status = "active"
    if result.get("next_node") == "END" or "verdict" in result.get("summary", {}):
        status = "completed"
        # Save to Chroma
        storage_service.save_session(result)
    
    return {
        "message": last_message,
        "audio_base64": audio_b64,
        "status": status
    }

@app.get("/interview/report/{session_id}")
async def get_report(session_id: str):
    data = storage_service.get_session(session_id)
    if not data:
         # Check in-memory
         if session_id in sessions:
             return sessions[session_id].get("summary", {"status": "in_progress"})
         raise HTTPException(status_code=404, detail="Session not found")
    return data.get("summary")

@app.post("/ats/evaluate")
async def evaluate_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        content = await resume.read()
        import io
        from pypdf import PdfReader
        from app.services.llm_service import llm_service
        from app.agents.prompts import ATS_SCANNER_PROMPT
        
        resume_text = ""
        try:
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                resume_text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

        prompt = ATS_SCANNER_PROMPT.format(
            job_description_text=job_description,
            resume_text=resume_text
        )
        
        response = llm_service.invoke_model(ATS_SCANNER_PROMPT, prompt)
        
        import re
        json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
        result = {}
        if json_match:
            try:
                result = json.loads(json_match.group(1).strip())
            except:
                pass
        else:
            try:
                 result = json.loads(response)
            except:
                pass
                
        if not result:
             result = {
                 "match_percentage": 0,
                 "status": "Error",
                 "analysis_summary": "Analysis failed.",
                 "recommendation": "Retry."
             }
        
        # --- Enterprise Logic ---
        # 1. Save Candidate Data
        candidate_id = db_service.save_candidate(resume_text, result)
        
        # 2. Issue Token if Qualified
        admission_token = None
        if result.get("match_percentage", 0) >= 75:
            admission_token = token_service.create_admission_token({
                "sub": candidate_id, 
                "name": "Candidate" # In real app, extract name
            })
            result["admission_token"] = admission_token
            
        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
