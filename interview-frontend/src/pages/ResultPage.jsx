import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CheckCircle, AlertTriangle, FileText, XCircle, Printer, Download,
    ShieldCheck, BarChart3, User, MessageSquare, ArrowLeft, Loader2,
    Briefcase, Award, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ResultPage = ({ sessionId }) => {
    const navigate = useNavigate();
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
                setLoading(false);
            }
        };

        fetchReport();
        const interval = setInterval(() => {
            if (loading && (!report || report.status === 'in_progress')) {
                fetchReport();
            } else if (!loading && report && report.status !== 'in_progress') {
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [sessionId, loading, report]);

    const handlePrint = () => window.print();

    if (loading && !report) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-6 max-w-sm text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full border-2 border-slate-100">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Generating Candidate Report</h3>
                    <p className="text-slate-500 text-sm">Compiling technical assessment and behavioral insights...</p>
                </div>
            </div>
        </div>
    );

    const getVerdictStyle = (v) => {
        const verdict = v?.toLowerCase() || '';
        if (verdict.includes('strong hire')) return {
            bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: <Award className="w-5 h-5" />
        };
        if (verdict === 'hire' || verdict.includes('hire')) return {
            bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <CheckCircle className="w-5 h-5" />
        };
        if (verdict.includes('consider')) return {
            bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: <AlertTriangle className="w-5 h-5" />
        };
        if (verdict.includes('improvement')) return {
            bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: <Zap className="w-5 h-5" />
        };
        return {
            bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <XCircle className="w-5 h-5" />
        };
    };

    const verdictStyle = getVerdictStyle(report.verdict);

    const tabs = [
        { id: 'overview', label: 'Executive Summary', icon: FileText },
        { id: 'skills', label: 'Technical Deep Dive', icon: BarChart3 },
        { id: 'transcript', label: 'Interview Transcript', icon: MessageSquare },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-20 font-['Inter']">
            {/* Enterprise Header Banner */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Assessment Report
                                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border border-slate-200">Confidential</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-mono">ID: {sessionId}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                            <Printer className="w-4 h-4" /> Print PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Download className="w-4 h-4" /> Export Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar (Nav + Verdict) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Verdict Card */}
                    <div className={`p-6 rounded-2xl border ${verdictStyle.bg} ${verdictStyle.border} flex flex-col items-center text-center`}>
                        <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm ${verdictStyle.text}`}>
                            {verdictStyle.icon}
                        </div>
                        <h2 className={`text-2xl font-extrabold mb-1 ${verdictStyle.text}`}>{report.verdict}</h2>
                        <p className={`text-xs opacity-80 ${verdictStyle.text} uppercase tracking-wider font-bold`}>Final Decision</p>

                        {report.overall_score && (
                            <div className="mt-4 pt-4 border-t border-black/5 w-full">
                                <span className="text-3xl font-black">{report.overall_score}%</span>
                                <span className="block text-xs font-medium opacity-70">Calculated Score</span>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-8">
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                            {/* Score Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Briefcase className="w-16 h-16 text-blue-600" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Technical</div>
                                    <div className="text-4xl font-extrabold text-slate-900">{report.technical_rating}<span className="text-lg text-slate-400 font-medium">/10</span></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <MessageSquare className="w-16 h-16 text-purple-600" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Communication</div>
                                    <div className="text-4xl font-extrabold text-slate-900">{report.communication_rating}<span className="text-lg text-slate-400 font-medium">/10</span></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Zap className="w-16 h-16 text-orange-600" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Confidence</div>
                                    <div className="text-4xl font-extrabold text-slate-900">{report.confidence_score}<span className="text-lg text-slate-400 font-medium">/10</span></div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">AI Executive Summary</h3>
                                </div>
                                <div className="p-8">
                                    <p className="text-lg leading-relaxed text-slate-700 font-medium">
                                        {report.short_summary}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'skills' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-blue-600" /> Technical Assessment Breakdown
                            </h3>

                            {report.evaluation_per_answer && report.evaluation_per_answer.length > 0 ? (
                                <div className="space-y-4">
                                    {report.evaluation_per_answer.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-slate-800 text-lg w-3/4">"{item.question}"</h4>
                                                <div className={`px-3 py-1 rounded-lg text-sm font-bold ${item.score >= 7 ? 'bg-green-100 text-green-700' : item.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    Score: {item.score}/10
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 italic border-l-4 border-slate-300">
                                                    "{(item.answer?.length > 150 ? item.answer.substring(0, 150) + "..." : item.answer) || 'No answer recorded'}"
                                                </div>
                                                <div className="flex gap-4 text-sm mt-4">
                                                    <div className="flex-1">
                                                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Technical Quality</span>
                                                        <p className="text-slate-800 font-medium">{item.technical_quality}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Feedback</span>
                                                        <p className="text-slate-800 font-medium">{item.feedback || item.hr_quality}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20 text-yellow-500" />
                                    <h3 className="font-bold text-slate-900 mb-2">Detailed data unavailable</h3>
                                    <p>The detailed per-answer analysis could not be retrieved. Please check the executive summary.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'transcript' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <h3 className="font-bold text-slate-900 mb-2">Transcript Access Restricted</h3>
                            <p className="max-w-md mx-auto mb-6">Full interview transcripts are encrypted. Please request access from the admin console.</p>
                            <button className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                                Request Access
                            </button>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ResultPage;
