# AI Interview Bot Agent

A comprehensive, voice-enabled AI interviewing platform designed to conduct technical interviews and screen resumes using advanced AI agents. The application combines a modern React frontend with a powerful FastAPI backend, leveraging AWS Bedrock (Llama 3), Polly, and Transcribe for a seamless, interactive experience.

## 🚀 Features

### 🤖 AI Interviewer
- **Voice Interaction**: Real-time voice conversation using AWS Polly (Text-to-Speech) and AWS Transcribe (Speech-to-Text).
- **Adaptive Questions**: 2 HR questions + 3 Technical questions tailored to the candidate's responses.
- **Real-time Chat**: Support for both voice and text input.
- **Live Feedback**: The agent acts as a professional interviewer, managing the conversation flow.

### 📄 ATS Resume Screener
- **Dedicated Screener**: Determine if a candidate is a good match for a job description.
- **Detailed Analysis**: Returns match percentage, missing keywords, and specific recommendations.
- **Instant Report**: Generates a JSON-based report on the fly.

### 📊 Comprehensive Results
- **Grading System**: Detailed evaluation (Strong Hire, Hire, Consider, etc.) based on a 70% cutoff.
- **Feedback**: Specific feedback on technical depth and communication.
- **Technical Deep Dive**: Visual breakdown of performance on technical topics.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI Orchestration**: LangGraph, LangChain
- **LLM**: AWS Bedrock (Llama 3 70B Instruct / Mistral)
- **Voice Services**: AWS Polly (TTS), AWS Transcribe (STT)
- **Storage**: ChromaDB (Vector Search), AWS S3 (Audio Storage)

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS 4, generic CSS
- **Routing**: React Router DOM (v7)
- **UI Components**: Lucide React, Framer Motion
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Python**: version 3.9 or higher
- **Node.js**: version 18 or higher
- **AWS Account**: with permissions for Bedrock, Polly, Transcribe, and S3.

## 💾 Installation

### 1. Backend Setup

1.  Navigate to the root directory `interview-bot`:
    ```bash
    cd interview-bot
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd interview-frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

## ⚙️ Configuration

Create a `.env` file in the root `interview-bot` directory. This file is **crucial** for the application to function.

```ini
# AWS Credentials (Required for Bedrock, Polly, Transcribe, S3)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1  # Recommended (most services available)

# LLM Configuration
BEDROCK_MODEL_ID=meta.llama3-70b-instruct-v1:0  # or mistral.mixtral-8x7b-instruct-v0:1

# Optional: LangSmith for tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key
```

> **Note**: The application attempts to create a unique S3 bucket automatically for storing temporary audio files for transcription. Ensure your AWS user has `s3:CreateBucket`, `s3:PutObject`, and `s3:GetObject` permissions.

## 🏃‍♂️ Running the Application

You need to run the backend and frontend in separate terminals.

### Terminal 1: Backend
From the root `interview-bot` directory:
```bash
uvicorn main:app --reload
```
*The backend API will start at `http://localhost:8000`.*

### Terminal 2: Frontend
From the `interview-frontend` directory:
```bash
npm run dev
```
*The frontend will start at `http://localhost:5173`.*

## 🗺️ Usage Flow

### A. Conducting an Interview
1.  **Landing Page**: Open the app (`http://localhost:5173`). Click **"Start Interview"**.
2.  **Resume Upload**: Upload your PDF resume. The AI reads it to contextually tailor questions.
3.  **System Check**: A wizard will check your Camera and Microphone permissions. Click **"Check Devices"** then **"I'm Ready"**.
4.  **Interview Session**:
    - The AI greets you audibly.
    - Speak your answer (ensure microphone is on) or type it.
    - The AI listens/reads, thinks (using LangGraph), and responds with the next question.
    - This continues for 5 questions (2 HR, 3 Technical).
5.  **Completion**: The session ends automatically. You will be redirected to the Results page.
6.  **Results**: View your detailed grade, feedback, and "Strong Hire/No Hire" verdict.

### B. ATS Resume Screening
1.  **Landing Page**: Click on the **"ATS Screener"** button (or navigate to `/ats`).
2.  **Input**:
    - Paste the **Job Description** text.
    - Upload the **Resume (PDF)**.
3.  **Analyze**: Click "Run ATS Scan".
4.  **Report**: View the match percentage, missing keywords, and improvement suggestions instantly.

## 📂 Project Structure

```
interview-bot/
├── app/
│   ├── agents/           # LangGraph agents & state logic (graph.py, prompts.py)
│   ├── services/         # External services (llm_service.py, voice_service.py)
│   └── main.py           # (Internal app references)
├── interview-frontend/   # React Application
│   ├── src/
│   │   ├── pages/        # Main Views (InterviewSession, ResultPage, ATSCheck)
│   │   ├── App.jsx       # Routing & Layout
│   │   └── main.jsx      # Entry point
│   └── package.json
├── main.py               # FastAPI Entry Point
├── requirements.txt      # Python Dependencies
└── .env                  # Environment Variables
```

## ⚠️ Troubleshooting

- **Audio not working?**
    - Ensure your browser has permission to access the Microphone.
    - Check the backend logs for AWS Polly/Transcribe errors.
    - Verify `AWS_REGION` supports the selected neural voices.

- **Transcription failing?**
    - The app uses S3 for transcription. If the S3 bucket fails to create (permission error), transcription will likely fail. Check your AWS IAM permissions.

- **"Session not found"?**
    - Refreshing the page during an interview might lose the session state (currently in-memory). Restart from the landing page.
