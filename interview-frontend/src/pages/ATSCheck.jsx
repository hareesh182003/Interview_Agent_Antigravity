import { useState } from 'react';
import { Shield, Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ATSCheck = () => {
    const navigate = useNavigate();
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [atsResult, setAtsResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile || !jobDescription) return;

        setAnalyzing(true);
        setAtsResult(null);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('job_description', jobDescription);

            const response = await axios.post('http://localhost:8000/ats/evaluate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAtsResult(response.data);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please check your connection and try again.");
        }
        setAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Enterprise ATS Scanner</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Talent Acquisition Suite</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                        Back to Interview
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Inputs */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Candidate Fit</h2>
                        <p className="text-slate-600">Upload a resume and job description to get an instant AI-powered suitability score.</p>
                    </div>

                    {/* Resume Upload */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> 1. Upload Resume
                        </h3>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative group bg-slate-50/50">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {resumeFile ? (
                                <div className="flex flex-col items-center text-green-600">
                                    <CheckCircle className="w-10 h-10 mb-3" />
                                    <span className="font-medium">{resumeFile.name}</span>
                                    <span className="text-xs text-slate-400 mt-1">Ready for scanning</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500">
                                    <Upload className="w-10 h-10 mb-3" />
                                    <span className="font-medium text-slate-600">Click or drag PDF resume here</span>
                                    <span className="text-xs mt-1">Supported format: PDF (Max 5MB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* JD Input */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-auto">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> 2. Job Description
                        </h3>
                        <textarea
                            className="w-full h-48 p-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y shadow-inner mb-6"
                            placeholder="Paste the full Job Description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        ></textarea>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-fadeIn mb-4">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!resumeFile || !jobDescription || analyzing}
                            className={`w-full py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98] ${!resumeFile || !jobDescription
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
                                }`}
                        >
                            {analyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Run Analysis <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-400 pb-8">
                        AI Analysis determines match based on skills, experience, and semantic relevance.
                    </p>
                </div>

                {/* Right Column: Results */}
                <div className="relative">
                    {/* Placeholder State */}
                    {!atsResult && !analyzing && (
                        <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <Shield className="w-24 h-24 mb-6 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
                            <p className="max-w-xs mx-auto">Upload documents and start the scan to see the detailed report here.</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {analyzing && (
                        <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
                                <Shield className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Profile...</h3>
                            <p className="text-slate-500">Matching keywords, calculating relevance score, and generating insights.</p>
                        </div>
                    )}

                    {/* Result State */}
                    {atsResult && !analyzing && (
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slideUp">
                            <div className={`p-8 text-white ${atsResult.match_percentage >= 80 ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Overall Match</div>
                                        <div className="text-5xl font-extrabold">{atsResult.match_percentage}%</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 font-bold tracking-wide uppercase text-sm">
                                        {atsResult.status}
                                    </div>
                                </div>
                                <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${atsResult.match_percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" /> Executive Summary
                                    </h4>
                                    <p className="text-slate-600 leading-7 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        {atsResult.analysis_summary}
                                    </p>
                                </div>

                                {atsResult.missing_keywords && atsResult.missing_keywords.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-red-600">
                                            <AlertCircle className="w-5 h-5" /> Missing Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsResult.missing_keywords.map((kw, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-sm font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" /> Recommendation
                                    </h4>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1 bg-green-200 h-12 rounded-full flex-shrink-0"></div>
                                        <p className="text-slate-700 italic">
                                            "{atsResult.recommendation}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ATSCheck;
