import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Users,
    FileText,
    BarChart,
    ArrowRight,
    CheckCircle,
    Play,
    Cpu,
    Globe
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] font-['Inter']">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-32">
                {/* Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Hero Content */}
                        <div className="space-y-8 animate-slideUp">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Next-Gen Recruitment AI
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                                Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Top 1%</span> <br />
                                with Confidence.
                            </h1>

                            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                                TalentScout AI Enterprise automates your entire screening process.
                                From ATS resume parsing to voice-based technical interviews,
                                we ensure you never miss a star candidate.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/check')}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    Start Interview <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/ats-check')}
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" /> Run ATS Scan
                                </button>
                            </div>

                            <div className="pt-8 flex items-center gap-8 text-sm text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> Enterprise Ready
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> GDPR Layout
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> 99.9% Uptime
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual/Dashboard Mock */}
                        <div className="relative hidden lg:block animate-fadeIn delay-200">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl rotate-3 blur-lg opacity-30"></div>
                            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">

                                {/* Mock Window Header */}
                                <div className="bg-slate-900/50 border-b border-slate-700 p-4 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono">TalentScout v2.0</div>
                                </div>

                                {/* Mock Dashboard Content */}
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    <div className="col-span-2 bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">JS</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">John Smith</div>
                                                    <div className="text-xs text-slate-400">Senior React Developer</div>
                                                </div>
                                            </div>
                                            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">92% MATCH</div>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-green-500"></div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 flex flex-col items-center justify-center text-center">
                                        <Cpu className="w-8 h-8 text-indigo-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">1,402</div>
                                        <div className="text-xs text-slate-400">Candidates Processed</div>
                                    </div>

                                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 flex flex-col items-center justify-center text-center">
                                        <Globe className="w-8 h-8 text-pink-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">12</div>
                                        <div className="text-xs text-slate-400">Global Regions</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Feature Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">The Future of Hiring is Here</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Replace manual resume screening and first-round interviews with our autonomous AI agents. Accurate, unbiased, and fast.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <FileText className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant ATS Screening</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Upload a JD and Resume to get an immediate compatibility score.
                                Our semantic engine understands context, not just keywords.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                <Users className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Voice-Based Interviews</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Conduct lifelike technical interviews with our AI. It speaks, listens, and
                                evaluates candidates on HR and technical questions in real-time.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                <BarChart className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Detailed Analytics</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Receive comprehensive reports with scoring breakdowns, red flag detection,
                                and hiring recommendations instantly after the interview.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Decorative Bottom */}
            <section className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-400">
                    <div className="font-mono text-sm">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</div>
                    <div className="flex gap-8 mt-4 md:mt-0 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* Faux Logos */}
                        <span className="font-bold text-xl">ACME Corp</span>
                        <span className="font-bold text-xl">Stark Ind</span>
                        <span className="font-bold text-xl">Wayne Ent</span>
                        <span className="font-bold text-xl">Cyberdyne</span>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
