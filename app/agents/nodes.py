import json
from app.services.llm_service import llm_service
from app.agents.prompts import INTERVIEWER_PROMPT, EVALUATOR_PROMPT, SUMMARIZER_PROMPT
from app.agents.state import InterviewState

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
    
    # Determine if we should end the interview
    if question_count >= 5:
        # Prompt LLM to finalize and output JSON
        prompt = f"""{INTERVIEWER_PROMPT}

CONVERSATION HISTORY:
{history_text}

Status: You have asked {question_count} questions. 
Instruction: The interview is over. Say the closing phrase and output the JSON memory as defined in the rules. 
IMPORTANT: Your output MUST contain the JSON block within ```json ... ``` or just valid JSON at the end.
"""
    else:
        # Dynamic instruction to prevent looping intro
        if question_count == 0:
             additional_instruction = "The Candidate has already been greeted. Do NOT greet again (e.g. 'Hello', 'Welcome'). Start immediately with the first Question."
        else:
             additional_instruction = "Ask the next question or follow-up."

        prompt = f"""{INTERVIEWER_PROMPT}

CONVERSATION HISTORY:
{history_text}

Status: You have asked {question_count} questions. 
Instruction: {additional_instruction} Do not switch to JSON mode yet. Output only the natural language response.
"""

    response = llm_service.invoke_model(INTERVIEWER_PROMPT, prompt)
    
    # Check if response contains JSON (interview termination)
    import re
    json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
    if json_match:
        try:
            json_str = json_match.group(1).strip()
            interview_data = json.loads(json_str)
            return {"interview_data": interview_data, "next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. I will now pass your responses for evaluation."}]} 
        except:
             # Fallback if JSON parsing fails
             return {"interview_data": {}, "next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. The interview is now finished. Please wait for your results."}]}
    elif question_count >= 5:
        # If we hit the limit but didn't get JSON, force move to evaluator with empty data
        return {"interview_data": {}, "next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. The interview is now finished. Please wait for your results."}]}
    
    # Normal conversation flow
    return {
        "messages": messages + [{"role": "assistant", "content": response}],
        "question_count": question_count + 1,
        "next_node": "interviewer"
    }

def evaluator_node(state: InterviewState):
    interview_data = state.get('interview_data', {})
    
    prompt = f"""{EVALUATOR_PROMPT}

INTERVIEW DATA:
{json.dumps(interview_data, indent=2)}

FULL TRANSCRIPT:
{state['messages']}

Note: If INTERVIEW DATA is empty, please rely entirely on the FULL TRANSCRIPT to generate the evaluation.
"""
    response = llm_service.invoke_model(EVALUATOR_PROMPT, prompt)
    
    # Extract JSON
    import re
    json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
    evaluation = {}
    
    try:
        if json_match:
            evaluation = json.loads(json_match.group(1).strip())
        else:
             # Try to parse raw response if it's just JSON
             evaluation = json.loads(response)
    except:
        print("Failed to parse Evaluator JSON")
        # Try a more aggressive cleanup if simple load fails
        try:
            # Find the first { and last }
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                evaluation = json.loads(response[start:end])
        except:
            pass

    # Fallback if evaluation is still empty
    if not evaluation:
        evaluation = {
            "evaluation_per_answer": [],
            "section_scores": {
                "hr_score": 0,
                "technical_score": 0,
                "communication_score": 0,
                "confidence_score": 0,
                "overall_score": 0
            },
            "red_flags": ["Evaluation generation failed"],
            "final_verdict": "Consider",
            "notes_for_summarizer": "The evaluator failed to produce a structured output. Please review the transcript."
        }

    return {"evaluation": evaluation, "next_node": "summarizer"}

def summarizer_node(state: InterviewState):
    evaluation = state.get('evaluation', {})
    
    prompt = f"""{SUMMARIZER_PROMPT}

EVALUATION DATA:
{json.dumps(evaluation, indent=2)}
"""
    response = llm_service.invoke_model(SUMMARIZER_PROMPT, prompt)
    
    import re
    json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
    summary = {}
    
    try:
        if json_match:
            summary = json.loads(json_match.group(1).strip())
        else:
            summary = json.loads(response)
    except:
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                summary = json.loads(response[start:end])
        except:
             pass
             
    if not summary:
        summary = {
            "short_summary": "We encountered an issue generating the summary.",
            "detailed_summary": "Please review the raw interview data as the automated summary generation failed.",
            "verdict": "Consider"
        }
    
    # Merge scores from evaluation into the final summary for Frontend display
    scores = evaluation.get("section_scores", {})
    summary["technical_rating"] = scores.get("technical_score", 0)
    summary["communication_rating"] = scores.get("communication_score", 0)
    summary["confidence_score"] = scores.get("confidence_score", 0)
    summary["overall_score"] = scores.get("overall_score", 0)

    # Pass the detailed evaluation per answer for the "Technical Deep Dive" tab
    summary["evaluation_per_answer"] = evaluation.get("evaluation_per_answer", [])

    return {"summary": summary, "next_node": "END"}
