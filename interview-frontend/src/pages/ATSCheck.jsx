import { useState } from 'react';
import { Shield, Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2, PieChart, Tag, BarChart as BarImp, User } from 'lucide-react';
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
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex font-['Inter']">

            {/* Mock Sidebar (Enterprise Vibe) */}
            <div className="w-64 bg-slate-900 text-slate-300 hidden lg:flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Module</span>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                        <Shield className="w-5 h-5 text-blue-500" /> ATS Scanner
                    </h2>
                </div>
                <div className="p-4 space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 font-medium cursor-pointer">
                        <FileText className="w-5 h-5" /> Scan Resume
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg cursor-not-allowed opacity-50">
                        <BarImp className="w-5 h-5" /> Analytics History
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg cursor-not-allowed opacity-50">
                        <User className="w-5 h-5" /> Candidates
                    </div>
                </div>
                <div className="mt-auto p-4 border-t border-slate-800">
                    <button onClick={() => navigate('/')} className="w-full py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800 transition-colors">
                        back to Home
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Requirement Analysis</h1>
                        <p className="text-slate-500">Benchmark candidates against job descriptions using advanced semantic matching.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Input Panel */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8 h-full">

                            {/* Step 1: Upload */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Candidate Document
                                </h3>
                                <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${resumeFile ? 'border-green-300 bg-green-50/20' : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'}`}>
                                    <div className="text-center relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {resumeFile ? (
                                            <div className="flex flex-col items-center text-green-700">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div className="font-bold text-sm">{resumeFile.name}</div>
                                                <div className="text-xs opacity-70">PDF Loaded</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                                                    <Upload className="w-6 h-6 text-slate-500" />
                                                </div>
                                                <div className="font-medium text-slate-600">Upload Resume PDF</div>
                                                <div className="text-xs mt-1">Drag & drop or click to browse</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: JD */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> Job Description
                                </h3>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-40 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
                                        placeholder="Paste the complete job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeFile || !jobDescription || analyzing}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${!resumeFile || !jobDescription
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                                    }`}
                            >
                                {analyzing ? <Loader2 className="animate-spin" /> : <>Run Suitability Analysis</>}
                            </button>

                            {/* Qualification Action */}
                            {atsResult && atsResult.match_percentage >= 75 && (
                                <div className="mt-8 pt-8 border-t border-slate-100 animate-fadeIn">
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-green-800 font-bold">
                                            <CheckCircle className="w-5 h-5" /> Qualified for Interview
                                        </div>
                                        <p className="text-sm text-green-700">
                                            Congratulations! Your profile matches our requirements. You have been granted an admission token.
                                        </p>
                                        <button
                                            onClick={() => navigate('/interview', { state: { admissionToken: atsResult.admission_token } })}
                                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20"
                                        >
                                            Proceed to Technical Round <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Result Panel */}
                        <div className="h-full min-h-[500px]">
                            {!atsResult && !analyzing && (
                                <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-12 text-center opacity-70">
                                    <PieChart className="w-16 h-16 mb-4 opacity-50" />
                                    <h3 className="text-lg font-bold mb-1">Awaiting Data</h3>
                                    <p className="text-sm">Analysis results will appear here after processing.</p>
                                </div>
                            )}

                            {analyzing && (
                                <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="relative w-32 h-32 mb-8">
                                        <svg className="animate-spin w-full h-full text-blue-100" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Shield className="w-10 h-10 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing...</h3>
                                    <p className="text-slate-500">Our AI agents are reading the documents.</p>
                                </div>
                            )}

                            {atsResult && !analyzing && (
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slideUp">
                                    {/* Score Header */}
                                    <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-16 -mt-16"></div>

                                        <div className="flex justify-between items-center relative z-10">
                                            <div>
                                                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Match Score</div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-extrabold tracking-tight">{atsResult.match_percentage}</span>
                                                    <span className="text-xl text-slate-500 font-medium">/100</span>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-lg border font-bold uppercase text-sm ${atsResult.match_percentage >= 80 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
                                                {atsResult.status}
                                            </div>
                                        </div>

                                        <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${atsResult.match_percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                                                style={{ width: `${atsResult.match_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 space-y-8">
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 text-lg">Analysis Summary</h4>
                                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 italic">
                                                "{atsResult.analysis_summary}"
                                            </p>
                                        </div>

                                        {atsResult.missing_keywords && atsResult.missing_keywords.length > 0 && (
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Keywords
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {atsResult.missing_keywords.map((kw, i) => (
                                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-sm font-medium flex items-center gap-1">
                                                            <Tag className="w-3 h-3" /> {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">AI Recommendation</h4>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <p className="text-slate-700 text-sm leading-6 pt-1">
                                                    {atsResult.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ATSCheck;
