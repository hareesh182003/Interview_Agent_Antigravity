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
            setError("Could not access Camera or Microphone. Please check permissions.");
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
            setError("Failed to initialize session. Please try again.");
        }
        setLoading(false);
    };

    const allChecksPassed = checks.mic && checks.camera && checks.speaker && resumeFile;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Visual / Camera Section */}
                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 rounded-full"></div>
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 relative z-10">
                            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative group">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                                {/* Status Indicators */}
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div className="flex gap-2">
                                        <div className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors ${checks.camera ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {checks.camera ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} Video
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors ${checks.mic ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {checks.mic ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} Audio
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm leading-relaxed">
                        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold block mb-1">Privacy & Compliance</span>
                            Sessions are monitored by AI for evaluation purposes only. Data is encrypted and stored securely according to enterprise standards.
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="space-y-8 lg:pt-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">System Check</h1>
                        <p className="text-slate-500 text-lg">Let's verify your setup before we begin the interview.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Audio Test */}
                        <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${checks.speaker ? 'bg-green-50/50 border-green-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${checks.speaker ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <Volume2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Audio Output</h3>
                                        <p className="text-xs text-slate-500">Click test to ensure you can hear the interviewer.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={testSpeaker}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${checks.speaker
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    {checks.speaker ? 'Working' : 'Test Sound'}
                                </button>
                            </div>
                        </div>

                        {/* Resume Upload */}
                        <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md bg-white border-slate-200`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${resumeFile ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Resume Upload</h3>
                                    <p className="text-xs text-slate-500">The AI will tailor questions to your profile.</p>
                                </div>
                            </div>

                            <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all relative group ${resumeFile ? 'border-green-300 bg-green-50/30' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {resumeFile ? (
                                    <div className="flex flex-col items-center text-green-700 animate-fadeIn">
                                        <CheckCircle className="w-8 h-8 mb-2" />
                                        <span className="font-bold text-sm">{resumeFile.name}</span>
                                        <span className="text-xs opacity-70 mt-1">Ready for upload</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <FileText className="w-8 h-8 mb-2" />
                                        <span className="font-medium text-sm">Drop PDF here or click to browse</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-shake">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={!allChecksPassed || loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-[0.99] ${allChecksPassed && !loading
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Join Interview Session <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium uppercase tracking-wider">
                        <span className={checks.camera ? 'text-green-500' : ''}>Camera</span>
                        <span className={checks.mic ? 'text-green-500' : ''}>Microphone</span>
                        <span className={checks.speaker ? 'text-green-500' : ''}>Speaker</span>
                        <span className={resumeFile ? 'text-green-500' : ''}>Resume</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SystemCheck;
