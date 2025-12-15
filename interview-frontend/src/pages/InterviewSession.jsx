import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Loader2, Video, MoreVertical, MessageSquare, User, AudioLines, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewSession = ({ sessionId, initialAudio, onComplete }) => {
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [messages, setMessages] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const navigate = useNavigate();

    // Fake audio visualizer bars
    const [audioBars, setAudioBars] = useState(new Array(5).fill(10));

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const hasPlayedRef = useRef(false);
    const streamRef = useRef(null);

    // Separate useEffect for Camera (Mount/Unmount only)
    useEffect(() => {
        if (initialAudio && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            playAudio(initialAudio);
        }
        setupCamera();

        return () => {
            stopCamera();
        };
    }, []);

    // Effect for Audio Visualizer (Runs on status change)
    useEffect(() => {
        const interval = setInterval(() => {
            if (status === 'speaking' || status === 'listening') {
                setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
            } else {
                setAudioBars(new Array(5).fill(10));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [status]);

    const stopCamera = () => {
        if (streamRef.current) {
            console.log("Stopping all camera tracks...");
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`Track ${track.label} stopped.`);
            });
            streamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
        }
    };

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { console.error("Camera error", e); }
    };

    const playAudio = (base64Audio) => {
        setStatus('speaking');
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const url = URL.createObjectURL(new Blob([byteArray], { type: 'audio/mp3' }));

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);

        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Audio playback error:", e);
        });

        audioPlayerRef.current.onended = () => {
            setStatus('idle');
            if (isFinishing) {
                stopCamera();
                if (onComplete) onComplete();
            }
        };
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = sendAudio;
            mediaRecorderRef.current.start();
            setStatus('listening');
        } catch (e) {
            console.error("Mic error", e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && status === 'listening') {
            mediaRecorderRef.current.stop();
            setStatus('processing');
        }
    };

    const sendAudio = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('audio_file', audioBlob, 'input.webm');

        try {
            const response = await axios.post('http://localhost:8000/interview/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { message, audio_base64, status: sessionStatus } = response.data;
            setMessages(prev => [...prev, { role: 'user', content: '(Audio Input)' }, { role: 'assistant', content: message }]);

            if (sessionStatus === 'completed') {
                setIsFinishing(true);
                playAudio(audio_base64);
            } else {
                playAudio(audio_base64);
            }
        } catch (e) {
            console.error("Chat Error", e);
            setStatus('idle');
            alert("Error sending audio.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-76px)] w-full bg-slate-950 overflow-hidden relative font-['Inter']">

            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Top Bar (Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="flex flex-col gap-1">
                    <h2 className="text-white font-bold text-lg tracking-tight">Technical Interview</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                            {status === 'processing' ? 'AI Thinking' : status === 'speaking' ? 'AI Speaking' : status === 'listening' ? 'Listening' : 'Ready'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowTranscript(!showTranscript)} className={`p-3 rounded-full backdrop-blur-md border transition-all ${showTranscript ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-slate-400 hover:bg-white/10 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center relative px-6 scale-[0.98]">

                {/* AI Avatar / Visualizer */}
                <div className="relative flex flex-col items-center z-10">

                    {/* Avatar Circle */}
                    <div className={`relative transition-all duration-700 ${status === 'speaking' ? 'w-48 h-48' : 'w-40 h-40'}`}>
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 blur-2xl opacity-40 animate-pulse`}></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-slate-900/50 shadow-2xl z-10">
                            <User className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Visualizer Bars */}
                    <div className="flex items-end gap-2 mt-8 h-12">
                        {audioBars.map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: h }}
                                className="w-2 bg-blue-500 rounded-full opacity-80"
                            />
                        ))}
                    </div>

                    {/* Subtitles */}
                    <div className="mt-8 h-24 flex items-center justify-center max-w-2xl text-center">
                        <AnimatePresence mode='wait'>
                            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                                <motion.p
                                    key={messages.length}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-2xl font-medium text-slate-200 leading-relaxed drop-shadow-md"
                                >
                                    "{messages[messages.length - 1].content}"
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User PIP */}
                <div className="absolute bottom-8 right-8 w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 z-20">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        You
                    </div>
                </div>

                {/* Transcript Panel Overlay */}
                <AnimatePresence>
                    {showTranscript && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="absolute right-0 top-0 bottom-0 w-96 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-white font-bold">Live Transcript</h3>
                                <button onClick={() => setShowTranscript(false)} className="text-slate-400 hover:text-white"><MoreVertical className="w-5 h-5 rotate-90" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <span className="text-xs text-slate-500 mb-1 capitalize opacity-70">{m.role}</span>
                                        <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none'}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
                    <button className="p-3 rounded-full hover:bg-white/10 text-slate-400 transition-colors">
                        <Video className="w-6 h-6" />
                    </button>

                    {/* Mic Button Main Interaction */}
                    <div className="relative group">
                        {status === 'processing' || status === 'speaking' ? (
                            <button disabled className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 cursor-not-allowed">
                                <AudioLines className="w-6 h-6 animate-pulse" />
                            </button>
                        ) : status === 'listening' ? (
                            <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/20 animate-pulse">
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                            </button>
                        ) : (
                            <button onClick={startRecording} className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95">
                                <Mic className="w-7 h-7" />
                            </button>
                        )}
                    </div>

                    <button onClick={() => { stopCamera(); navigate('/'); }} className="p-3 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default InterviewSession;
