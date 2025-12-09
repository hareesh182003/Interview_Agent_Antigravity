import { useState } from 'react';
import SystemCheck from './pages/SystemCheck';
import InterviewSession from './pages/InterviewSession';
import ResultPage from './pages/ResultPage';
import { LayoutDashboard, ShieldCheck, FileText } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('system-check');
  const [sessionId, setSessionId] = useState(null);
  const [initialAudio, setInitialAudio] = useState(null);

  const startInterview = (id, audio) => {
    setSessionId(id);
    setInitialAudio(audio);
    setCurrentPage('interview');
  };

  const endInterview = () => {
    setCurrentPage('result');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TalentScout<span className="text-blue-600">AI</span></h1>
              <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest">Enterprise Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <div className={`flex items-center gap-2 ${currentPage === 'system-check' ? 'text-blue-600' : ''}`}>
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
              System Check
            </div>
            <div className="w-8 h-[1px] bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${currentPage === 'interview' ? 'text-blue-600' : ''}`}>
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
              Interview
            </div>
            <div className="w-8 h-[1px] bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${currentPage === 'result' ? 'text-blue-600' : ''}`}>
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">3</span>
              Results
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-full">
          {currentPage === 'system-check' && <SystemCheck onComplete={startInterview} />}
          {currentPage === 'interview' && <InterviewSession sessionId={sessionId} initialAudio={initialAudio} onComplete={endInterview} />}
          {currentPage === 'result' && <ResultPage sessionId={sessionId} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} TalentScout AI Enterprise. All rights reserved. Secure & Private.
        </div>
      </footer>
    </div>
  );
}

export default App;
