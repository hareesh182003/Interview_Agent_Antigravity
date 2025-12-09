import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CheckCircle, AlertTriangle, FileText, XCircle, Printer, Download,
    ShieldCheck, BarChart3, User, MessageSquare, ArrowLeft, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ResultPage = ({ sessionId }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/interview/report/${sessionId}`);
                setReport(response.data);
                if (response.data.status !== 'in_progress') {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching report", err);
                setLoading(false); // Stop loading even on error
            }
        };

        // Initial fetch
        fetchReport();

        // Poll if status is in_progress (optional, but good for robustness)
        const interval = setInterval(() => {
            if (loading && (!report || report.status === 'in_progress')) {
                fetchReport();
            } else if (!loading && report && report.status !== 'in_progress') {
                clearInterval(interval); // Stop polling once report is final
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [sessionId, loading, report]);

    const handlePrint = () => {
        window.print();
    };

    if (loading && !report) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="flex flex-col items-center gap-4 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="font-medium animate-pulse">Generating Comprehensive Assessment...</p>
            </div>
        </div>
    );

    if (!report || report.status === 'in_progress') {
        // Show loading if we have specific status
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="font-medium animate-pulse">Finalizing Analysis... Please wait.</p>
                </div>
            </div>
        );
    }

    const getVerdictColor = (v) => {
        const verdict = v?.toLowerCase() || '';
        if (verdict.includes('hire')) return 'text-green-600 bg-green-50 border-green-200';
        if (verdict.includes('consider')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const tabs = [
        { id: 'overview', label: 'Executive Summary', icon: FileText },
        { id: 'skills', label: 'Skills Analysis', icon: BarChart3 },
        { id: 'transcript', label: 'Transcript Review', icon: MessageSquare },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header / Verdict Banner */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-16 z-30">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        Candidate Assessment Report
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Ref ID: <span className="font-mono">{sessionId}</span></p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full border font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${getVerdictColor(report.verdict)}`}>
                        {report.verdict || "Analysis Pending"}
                    </div>
                    <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors print:hidden">
                        <Printer className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row mt-8 gap-8 px-4 md:px-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-2 print:hidden">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}

                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <button onClick={() => window.location.reload()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Start New Interview
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] overflow-hidden">
                    <div className="p-8">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                {/* Key Metrics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Confidence Score</div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.confidence_score || "N/A"}<span className="text-lg text-slate-400 font-normal">/10</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Technical Rating</div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.technical_rating || "N/A"}<span className="text-lg text-slate-400 font-normal">/10</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Comm. Skills</div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.communication_rating || "N/A"}<span className="text-lg text-slate-400 font-normal">/10</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Executive Summary</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg border-l-4 border-blue-500 pl-4 py-1">
                                        {report.short_summary || "No summary available."}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'skills' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Technical Analysis</h3>
                                <div className="prose prose-slate max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-700 leading-7">
                                        {report.detailed_summary || "Detailed analysis not available."}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'transcript' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Interview Transcript</h3>
                                <div className="space-y-4">
                                    <p className="text-slate-500 italic">Transcript is stored securely. (Placeholder for full log display)</p>
                                    {/* If we had transcript in report, map it here. For now just placeholder or we can access if backend sends it */}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResultPage;
