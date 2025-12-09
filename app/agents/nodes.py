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
        prompt = f"""{INTERVIEWER_PROMPT}

CONVERSATION HISTORY:
{history_text}

Status: You have asked {question_count} questions. 
Instruction: Ask the next question or follow-up. Do not switch to JSON mode yet. Output only the natural language response.
"""

    response = llm_service.invoke_model(INTERVIEWER_PROMPT, prompt)
    
    # Check if response contains JSON (interview termination)
    import re
    json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
    if json_match:
        try:
            json_str = json_match.group(1).strip()
            interview_data = json.loads(json_str)
            return {"interview_data": interview_data, "next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. I will now pass your responses for evaluation."}]} # Manually adding closing if LLM didn't clearly separate
        except:
             # Fallback if JSON parsing fails, maybe try to evaluate anyway or just end
             return {"next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. The interview is now finished. Please wait for your results."}]}
    elif question_count >= 5:
        return {"next_node": "evaluator", "messages": messages + [{"role": "assistant", "content": "Thank you. The interview is now finished. Please wait for your results."}]}
    
    # Normal conversation flow
    return {
        "messages": messages + [{"role": "assistant", "content": response}],
        "question_count": question_count + 1,
        "next_node": "interviewer"
    }

def evaluator_node(state: InterviewState):
    interview_data = state.get('interview_data', {})
    # If LLM didn't output structured data in interviewer node, we might need to parse history here or pass history to Evaluator.
    # The prompt says Evaluator analyzes "all interview answers provided by the Interviewer Agent".
    # We can pass the full history or the 'answers' list if extracted.
    
    prompt = f"""{EVALUATOR_PROMPT}

INTERVIEW DATA:
{json.dumps(interview_data, indent=2)}

FULL TRANSCRIPT:
{state['messages']}
"""
    response = llm_service.invoke_model(EVALUATOR_PROMPT, prompt)
    
    # Extract JSON
    import re
    json_match = re.search(r"```json(.*?)```", response, re.DOTALL)
    evaluation = {}
    if json_match:
        try:
            evaluation = json.loads(json_match.group(1).strip())
        except:
            print("Failed to parse Evaluator JSON")
    else:
        # Try to parse raw response if it's just JSON
        try:
            evaluation = json.loads(response)
        except:
            pass

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
    if json_match:
        try:
            summary = json.loads(json_match.group(1).strip())
        except:
            pass
    else:
        try:
            summary = json.loads(response)
        except:
            pass
            
    return {"summary": summary, "next_node": "END"}
