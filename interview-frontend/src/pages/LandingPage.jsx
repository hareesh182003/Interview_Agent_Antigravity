import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    FileText,
    Mic,
    FileBarChart,
    ArrowRight,
    CheckCircle,
    Cpu,
    Globe,
    Lock
} from 'lucide-react';

const LandingPage = () => {
    const useNavigateHook = useNavigate();

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] font-['Inter'] bg-slate-50">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-36 clip-path-slant">
                {/* Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 animate-slideUp">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold backdrop-blur-md uppercase tracking-wider">
                            <Lock className="w-3 h-3" />
                            Secure Enterprise Protocol
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl">
                            One Unified Flow for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Autonomous Hiring</span>
                        </h1>

                        <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                            Experience a singular, unbroken qualification pipeline.
                            From intelligent resume parsing to behavioral voice analysis,
                            all in one secure session.
                        </p>

                        <div className="pt-8 w-full max-w-md">
                            <button
                                onClick={() => useNavigateHook('/ats-check')}
                                className="group w-full relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white rounded-2xl p-1 transition-all shadow-2xl shadow-blue-500/20 transform hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all group-hover:opacity-90"></div>
                                <div className="relative bg-slate-900/10 rounded-xl px-8 py-5 flex items-center justify-center gap-3 font-bold text-lg">
                                    Start Assessment Protocol
                                    <div className="bg-white/20 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </button>
                            <p className="mt-4 text-sm text-slate-500 font-medium">
                                *Requires Valid Candidate Resume (PDF)
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Unified Process Section */}
            <section className="py-24 relative z-10 -mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Step 1: Qualification */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start hover:shadow-2xl transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300 group-hover:text-blue-200 transition-colors">01</div>
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                <FileText className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">ATS Qualification</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                The gatekeeper. Upload a resume to be instantly scanned against the Job Description.
                                Only candidates scoring &gt;75% receive an <span className="font-semibold text-blue-600">Admission Token</span> to proceed.
                            </p>
                        </div>

                        {/* Step 2: Assessment */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start hover:shadow-2xl transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300 group-hover:text-indigo-200 transition-colors">02</div>
                            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                                <Mic className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Voice Assessment</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Secure logic injection. The AI Interviewer receives the verified resume context directly from the server.
                                Conducts a behavioral & technical deep-dive.
                            </p>
                        </div>

                        {/* Step 3: Analysis */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start hover:shadow-2xl transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300 group-hover:text-purple-200 transition-colors">03</div>
                            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                                <FileBarChart className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Executive Decision</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Immediate generation of the Hiring Report.
                                Includes specific "Strengths", "Red Flags", and a final calculated "Hire/No Hire" verdict.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Enterprise Trust Badges */}
            <section className="pb-20 pt-10">
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 pt-12">
                    <div className="flex flex-wrap justify-between items-center gap-8 opacity-60">
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <ShieldCheck className="w-5 h-5" /> SOC2 Compliant
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <Globe className="w-5 h-5" /> Global Access
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <Cpu className="w-5 h-5" /> Neural Engine V4
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <CheckCircle className="w-5 h-5" /> 99.99% Accuracy
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
