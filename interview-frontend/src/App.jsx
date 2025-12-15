import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PreInterviewCheck from './pages/PreInterviewCheck';
import InterviewSession from './pages/InterviewSession';
import ResultPage from './pages/ResultPage';
import ATSCheck from './pages/ATSCheck';
import { ShieldCheck } from 'lucide-react';

// Wrapper for content to access useLocation
const AppContent = () => {
  const location = useLocation();

  // Simple way to pass state between routes without context for now, 
  // but in a real app we'd use Context or Redux.
  // For this refactor, we'll keep the session state management simple or pass via navigation state.
  // Actually, react-router passing state is cleaner.

  // However, the original App had state `sessionId` lifting up. 
  // To minimize refactor risk, we can keep using a wrapper or just let components manage their params.
  // `InterviewSession` takes props. We should update it to read from `useLocation` state equivalent.

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TalentScout<span className="text-blue-600">AI</span></h1>
              <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest">Enterprise Edition</p>
            </div>
          </Link>

          {/* Simplified Nav Steps for Interview Flow */}
          {location.pathname !== '/' && (
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 hidden md:flex">
              <div className={`flex items-center gap-2 ${location.pathname === '/ats-check' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
                ATS Screening
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${location.pathname === '/interview' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
                Technical Interview
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${location.pathname === '/result' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">3</span>
                Analysis Report
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/check" element={<PreInterviewCheckWrapper />} />
          <Route path="/ats-check" element={<ATSCheck />} />
          <Route path="/interview" element={<InterviewSessionWrapper />} />
          <Route path="/result" element={<ResultPageWrapper />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} TalentScout AI Enterprise. All rights reserved. Secure & Private.
        </div>
      </footer>
    </div>
  );
};

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PreInterviewCheckWrapper = () => {
  const navigate = useNavigate();
  const handleComplete = (sessionId, initialAudio) => {
    // Navigate with state
    navigate('/interview', { state: { sessionId, initialAudio } });
  };
  return <PreInterviewCheck onComplete={handleComplete} />;
};

const InterviewSessionWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [sessionData, setSessionData] = useState({
    sessionId: state.sessionId,
    initialAudio: state.initialAudio
  });
  const [initializing, setInitializing] = useState(!!state.admissionToken && !state.sessionId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state.admissionToken && !sessionData.sessionId) {
      const initSession = async () => {
        try {
          const response = await axios.post('http://localhost:8000/interview/init', {}, {
            headers: { Authorization: `Bearer ${state.admissionToken}` }
          });
          setSessionData({
            sessionId: response.data.session_id,
            initialAudio: response.data.audio_base64
          });
        } catch (err) {
          console.error(err);
          setError("Failed to verify admission token. Please try again.");
        } finally {
          setInitializing(false);
        }
      };
      initSession();
    }
  }, [state.admissionToken]);

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 animate-pulse">Verifying Admission Token & Initializing Secure Session...</p>
      </div>
    );
  }

  if (error || !sessionData.sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500 font-medium">{error || "No active session found."}</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Return to Start</button>
      </div>
    );
  }

  const handleComplete = () => {
    navigate('/result', { state: { sessionId: sessionData.sessionId } });
  };

  return <InterviewSession sessionId={sessionData.sessionId} initialAudio={sessionData.initialAudio} onComplete={handleComplete} />;
};

const ResultPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = location.state || {};

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p>No result to display.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Home</button>
      </div>
    );
  }

  return <ResultPage sessionId={sessionId} />;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
