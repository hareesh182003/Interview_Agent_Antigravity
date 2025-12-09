import { useState, useRef, useEffect } from 'react';
import { Mic, Camera, Volume2, CheckCircle, AlertCircle, FileText, Loader2, ArrowRight, Shield } from 'lucide-react';
import axios from 'axios';

const SystemCheck = ({ onComplete }) => {
    const [checks, setChecks] = useState({ mic: false, camera: false, speaker: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    // ATS State
    const [jobDescription, setJobDescription] = useState('');
    const [atsResult, setAtsResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        checkDevices();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const checkDevices = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setChecks(prev => ({ ...prev, mic: true, camera: true }));
        } catch (err) {
            console.error("Device Error:", err);
            setError("Could not access Camera or Microphone. Please allow permissions.");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const testSpeaker = () => {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().then(() => {
            setChecks(prev => ({ ...prev, speaker: true }));
        }).catch(e => {
            console.error(e);
            setError("Speaker test failed. Please check your volume.");
        });
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            const response = await axios.post('http://localhost:8000/interview/start', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { session_id, audio_base64 } = response.data;
            onComplete(session_id, audio_base64);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to backend server. Is it running?");
        }
        setLoading(false);
    };

    const handleATSAnalyze = async () => {
        setAnalyzing(true);
        setAtsResult(null);
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
            setError("ATS Analysis failed. Please try again.");
        }
        setAnalyzing(false);
    };

    const allChecksPassed = checks.mic && checks.camera && checks.speaker && resumeFile;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">System Readiness Check</h1>
                <p className="text-slate-500">Ensure your equipment is working correctly before joining the interview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Camera Preview */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-600" /> Camera Preview
                        </h3>
                        <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />

                            {/* Status Badges Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-md ${checks.camera ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                                    {checks.camera ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} Camera
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-md ${checks.mic ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                                    {checks.mic ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} Microphone
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">Your background should be clear and well-lit.</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <p>This session is recorded for evaluation purposes. By continuing, you agree to our privacy policy.</p>
                    </div>
                </div>

                {/* Column 2: Checks and Actions */}
                <div className="space-y-6">
                    {/* ATS Navigation Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg border border-blue-500 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Job Fit Analysis (ATS)
                            </h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Want to check if your resume matches the job description before starting? Use our AI-powered ATS scanner.
                            </p>
                            <a href="/ats-check" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-md">
                                <Shield className="w-4 h-4" /> Open ATS Scanner <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Audio Check Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-blue-600" /> Audio Output
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Click to verify you can hear audio.
                            </div>
                            <button
                                onClick={testSpeaker}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${checks.speaker
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                            >
                                {checks.speaker ? 'Speaker Working' : 'Test Speaker'}
                            </button>
                        </div>
                    </div>

                    {/* Resume Upload Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> Resume Upload
                        </h3>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative group">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                {resumeFile ? (
                                    <div className="flex flex-col items-center text-green-600">
                                        <CheckCircle className="w-8 h-8 mb-2" />
                                        <span className="font-medium text-sm">{resumeFile.name}</span>
                                        <span className="text-xs text-slate-400 mt-1">Ready for analysis</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500">
                                        <FileText className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium text-slate-600">Click or drag PDF here</span>
                                        <span className="text-xs mt-1">Maximum size 5MB</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleStart}
                        disabled={!allChecksPassed || loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${allChecksPassed && !loading
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Join Session <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        Checks: Camera {checks.camera ? '✓' : '✗'} • Mic {checks.mic ? '✓' : '✗'} • Speaker {checks.speaker ? '✓' : '✗'} • Resume {resumeFile ? '✓' : '✗'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SystemCheck;
