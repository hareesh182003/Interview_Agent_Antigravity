from langgraph.graph import StateGraph, END
from app.agents.state import InterviewState
from app.agents.nodes import interviewer_node, evaluator_node, summarizer_node

def build_graph():
    workflow = StateGraph(InterviewState)
    
    workflow.add_node("interviewer", interviewer_node)
    workflow.add_node("evaluator", evaluator_node)
    workflow.add_node("summarizer", summarizer_node)
    
    workflow.set_entry_point("interviewer")
    
    # Conditional edges are tricky if we want to loop. 
    # In `interviewer_node`, we return `next_node`. We can use that.
    
    # Logic:
    # If interviewer returns "interviewer" (loop), we actually want to STOP to wait for user input.
    # So we should edge "interviewer" -> END if continuing, 
    # BUT we need to loop back when user replies.
    # In a request-response API, the "User" is external.
    # So the graph flow for ONE request is:
    # Start (User Input in State) -> Interviewer Node -> END (Response generated).
    # Next request: Update State -> Start -> Interviewer Node -> ...
    # BUT, if we hit question 5, Interviewer Node returns "evaluator".
    # So:
    # "interviewer" -> END (if count < 5)
    # "interviewer" -> "evaluator" (if count >= 5)
    
    def router(state: InterviewState):
        next_node = state.get("next_node")
        if next_node == "evaluator":
            return "evaluator"
        return END # Stop to send response to user

    workflow.add_conditional_edges(
        "interviewer",
        router,
        {
            END: END,
            "evaluator": "evaluator"
        }
    )
    
    workflow.add_edge("evaluator", "summarizer")
    workflow.add_edge("summarizer", END)
    
    return workflow.compile()

graph = build_graph()
