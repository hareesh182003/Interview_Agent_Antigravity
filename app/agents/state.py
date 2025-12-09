from typing import TypedDict, List, Dict, Any, Optional

class InterviewState(TypedDict):
    messages: List[Dict[str, str]]  # History of conversation
    current_question: Optional[str]
    question_count: int
    interview_data: Optional[Dict[str, Any]] # Data collected by Interviewer
    analysis: Optional[dict]
    resume_text: Optional[str]
    evaluation: Optional[Dict[str, Any]]     # Output of Evaluator
    summary: Optional[Dict[str, Any]]        # Output of Summarizer
    next_node: Optional[str]                 # Control flow
