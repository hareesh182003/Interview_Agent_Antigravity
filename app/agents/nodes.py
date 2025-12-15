import json
import re
from app.services.llm_service import llm_service
from app.agents.prompts import INTERVIEWER_PROMPT, EVALUATOR_PROMPT, SUMMARIZER_PROMPT
from app.agents.state import InterviewState

def extract_json(response: str):
    """Helper to extract JSON from LLM response"""
    try:
        # First try finding markdown json block
        json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1).strip())
        
        # Then try just finding { ... }
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(response[start:end])
            
        return None
    except:
        return None

def interviewer_node(state: InterviewState):
    messages = state.get('messages', [])
    question_count = state.get('question_count', 0)
    
    # Construct conversation history for LLM
    resume_text = state.get('resume_text', "")
    history_text = ""
    if resume_text:
        history_text += f"RESUME CONTEXT:\n{resume_text}\n\n"
        
    for msg in messages:
        role = msg['role']
        content = msg['content']
        history_text += f"{role.upper()}: {content}\n"
    
    # Max question limit (increased to 15 as per new prompt)
    MAX_QUESTIONS = 15
    
    if question_count >= MAX_QUESTIONS:
        # Force termination
        prompt = f"""{INTERVIEWER_PROMPT}

CONVERSATION HISTORY:
{history_text}

Status: You have asked {question_count} questions. 
Instruction: The limit has been reached. Force the end of the interview. Say the closing phrase and output the final JSON immediately.
"""
    else:
        # Normal flow
        if question_count == 0:
             additional_instruction = "The Candidate has already been greeted. Start immediately with the first Question of the Introduction phase."
        else:
             additional_instruction = "Continue the interview phases. Ask the next question or follow-up. If you have sufficient data, you may choose to end the interview now."

        prompt = f"""{INTERVIEWER_PROMPT}

CONVERSATION HISTORY:
{history_text}

Status: You have asked {question_count} questions. 
Instruction: {additional_instruction}
"""

    response = llm_service.invoke_model(INTERVIEWER_PROMPT, prompt)
    
    # Check if response contains JSON (interview termination)
    # The new prompt says "Say closing phrase... then silently output JSON".
    interview_data = extract_json(response)
    
    if interview_data:
        # We found JSON, so the interview is done.
        # We need to extract the "Thank you" message to show the user.
        # We found JSON, so the interview is done.
        # Force a clean exit message to prevent the bot from reading the JSON aloud.
        text_content = "Thank you for your time. I have gathered all the necessary information. We will now generate your performance report."

        return {
            "interview_data": interview_data, 
            "next_node": "evaluator", 
            "messages": messages + [{"role": "assistant", "content": text_content}]
        }
        
    elif question_count >= MAX_QUESTIONS:
        # If we hit limit but no JSON, force move to evaluator
        return {
            "interview_data": {"note": "Interview forced end via max questions"}, 
            "next_node": "evaluator", 
            "messages": messages + [{"role": "assistant", "content": "Thank you. The interview is now finished."}]
        }
    
    # Normal conversation flow
    return {
        "messages": messages + [{"role": "assistant", "content": response}],
        "question_count": question_count + 1,
        "next_node": "interviewer"
    }

def evaluator_node(state: InterviewState):
    interview_data = state.get('interview_data', {})
    
    # We pass the interview_transcript (if available) or raw messages
    transcript_data = interview_data.get('interview_transcript', state['messages'])
    
    prompt = f"""{EVALUATOR_PROMPT}

INTERVIEW TRANSCRIPT DATA:
{json.dumps(transcript_data, indent=2)}

CANDIDATE NAME: {interview_data.get('candidate_name', 'Unknown')}
INTERVIEWER OBS: {interview_data.get('interviewer_observation', 'None')}
"""
    response = llm_service.invoke_model(EVALUATOR_PROMPT, prompt)
    
    evaluation = extract_json(response)
    
    if not evaluation:
        evaluation = {
            "detailed_analysis": [],
            "category_scores": {
                "technical_score": 0,
                "communication_score": 0,
                "soft_skills_score": 0
            },
            "overall_weighted_score": 0,
            "strengths": [],
            "weaknesses": ["Analysis failed"],
            "red_flags": [],
            "final_verdict": "Consider"
        }

    return {"evaluation": evaluation, "next_node": "summarizer"}

def summarizer_node(state: InterviewState):
    evaluation = state.get('evaluation', {})
    
    prompt = f"""{SUMMARIZER_PROMPT}

EVALUATION DATA:
{json.dumps(evaluation, indent=2)}
"""
    response = llm_service.invoke_model(SUMMARIZER_PROMPT, prompt)
    
    summary = extract_json(response)
    
    if not summary:
        summary = {
            "candidate_profile": {"name": "Unknown", "overall_rating": "0/100", "recommendation": "Consider"},
            "executive_summary": "Issue generating summary.",
            "key_findings": {},
            "interview_highlights": []
        }
    
    # --- MAPPING for Frontend Compatibility ---
    # Frontend expects: technical_rating, communication_rating, confidence_score, overall_score, short_summary
    
    scores = evaluation.get("category_scores", {})
    summary["technical_rating"] = scores.get("technical_score", 0)
    summary["communication_rating"] = scores.get("communication_score", 0)
    
    # Map 'soft_skills_score' (from new prompt) to 'confidence_score' (Frontend expectation)
    summary["confidence_score"] = scores.get("soft_skills_score", 0)
    
    summary["overall_score"] = evaluation.get("overall_weighted_score", 0)
    
    # Verdict location varies between prompt versions
    # New prompt: evaluation.final_verdict OR summary.candidate_profile.recommendation
    summary["verdict"] = evaluation.get("final_verdict", 
                                      summary.get("candidate_profile", {}).get("recommendation", "Consider"))
    
    # Map 'executive_summary' -> 'short_summary'
    summary["short_summary"] = summary.get("executive_summary", "")

    # Map 'detailed_analysis' -> 'evaluation_per_answer'
    # Prompt: detailed_analysis = [{question, answer_summary, category, rating, reasoning}]
    # Frontend: evaluation_per_answer = [{question, score, technical_quality, feedback, answer}]
    
    raw_analysis = evaluation.get("detailed_analysis", [])
    mapped_analysis = []
    for item in raw_analysis:
        mapped_analysis.append({
            "question": item.get("question", ""),
            "answer": item.get("answer_summary", ""), # Map answer_summary to answer
            "score": item.get("rating", 0),
            "technical_quality": item.get("reasoning", ""), # Use reasoning for technical quality slot
            "feedback": item.get("reasoning", ""), 
            "hr_quality": item.get("category", "") # Store category here
        })
    summary["evaluation_per_answer"] = mapped_analysis

    return {"summary": summary, "next_node": "END"}
