import requests
import base64
import time

BASE_URL = "http://localhost:8000"

def test_flow():
    print("1. Starting Interview...")
    response = requests.post(f"{BASE_URL}/interview/start")
    if response.status_code != 200:
        print(f"Failed to start: {response.text}")
        return
    
    data = response.json()
    session_id = data['session_id']
    print(f"Session ID: {session_id}")
    print(f"Bot: {data['message']}")
    
    # Simulate Audio Base64 (Optional: Decode to check, but we skip)
    
    # 2. Chat Loop
    for i in range(1, 7): # Go up to 6 turns (Intro + 5 Qs)
        time.sleep(1)
        print(f"\n--- Turn {i} ---")
        
        # User answer (Text for simplicity)
        user_answer = f"This is my answer to question number {i}. I have experience with Python and AWS."
        print(f"User: {user_answer}")
        
        response = requests.post(
            f"{BASE_URL}/interview/chat",
            data={"session_id": session_id, "text_input": user_answer}
        )
        
        if response.status_code != 200:
            print(f"Failed to chat: {response.text}")
            break
            
        chat_data = response.json()
        print(f"Bot: {chat_data['message']}")
        
        if chat_data['status'] == 'completed':
            print("Interview Completed!")
            break

    # 3. Get Report
    print("\n3. Fetching Report...")
    response = requests.get(f"{BASE_URL}/interview/report/{session_id}")
    if response.status_code == 200:
        print("Report:", response.json())
    else:
        print("Failed to get report or still processing.")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"Test failed: {e}")
