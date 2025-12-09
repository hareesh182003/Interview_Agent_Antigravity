import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SystemCheck from './pages/SystemCheck';
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
          {location.pathname !== '/ats-check' && (
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 hidden md:flex">
              <div className={`flex items-center gap-2 ${location.pathname === '/' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
                System Check
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${location.pathname === '/interview' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
                Interview
              </div>
              <div className="w-8 h-[1px] bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${location.pathname === '/result' ? 'text-blue-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">3</span>
                Results
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        <Routes>
          <Route path="/" element={<SystemCheckWrapper />} />
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

// Wrappers to adapt old prop-based components to Route components
import { useNavigate } from 'react-router-dom';

const SystemCheckWrapper = () => {
  const navigate = useNavigate();
  const handleComplete = (sessionId, initialAudio) => {
    // Navigate with state
    navigate('/interview', { state: { sessionId, initialAudio } });
  };
  return <SystemCheck onComplete={handleComplete} />;
};

const InterviewSessionWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, initialAudio } = location.state || {}; // Handle missing state?

  if (!sessionId) {
    // Redirect to start if no session
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p>No active session found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Start New</button>
      </div>
    );
  }

  const handleComplete = () => {
    navigate('/result', { state: { sessionId } });
  };

  return <InterviewSession sessionId={sessionId} initialAudio={initialAudio} onComplete={handleComplete} />;
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
