import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, Video, MoreVertical, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewSession = ({ sessionId, initialAudio, onComplete }) => {
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [messages, setMessages] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());

    useEffect(() => {
        if (initialAudio) playAudio(initialAudio);
        setupCamera();
    }, []);

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
        audioPlayerRef.current.play();
        audioPlayerRef.current.onended = () => {
            setStatus('idle');
            if (isFinishing && onComplete) onComplete();
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
        <div className="flex flex-col h-[calc(100vh-10rem)] w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top Bar (Call Info) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-slate-800/80 backdrop-blur rounded text-xs font-mono text-slate-300 border border-slate-700">
                        {status === 'processing' ? 'Thinking...' : status === 'speaking' ? 'Interviewer Speaking' : status === 'listening' ? 'You are speaking' : 'Waiting for response'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowTranscript(!showTranscript)} className={`p-2 rounded-full ${showTranscript ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-300'}`}>
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-slate-800/80 rounded-full text-slate-300">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Video Grid */}
            <div className="flex-1 flex p-4 gap-4 relative">
                {/* AI Interviewer (Main View) */}
                <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-slate-700">
                    <motion.div
                        animate={{ scale: status === 'speaking' ? 1.05 : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20"
                    >
                        {status === 'processing' ? <Loader2 className="w-16 h-16 text-white/50 animate-spin" /> : <User className="w-16 h-16 text-white" />}
                    </motion.div>

                    {/* Subtitles Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-center">
                        <AnimatePresence mode='wait'>
                            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                                <motion.p
                                    key={messages.length}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-xl inline-block max-w-2xl text-lg font-medium leading-relaxed shadow-lg"
                                >
                                    {messages[messages.length - 1].content}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="absolute bottom-2 left-2 text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded">AI Interviewer</div>
                </div>

                {/* User Self View (PiP or Split) */}
                <div className="w-1/4 max-w-xs bg-black rounded-xl overflow-hidden border border-slate-700 relative shadow-xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-2 left-2 text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded">You</div>

                    {/* Active Speaker Indicator */}
                    {status === 'listening' && (
                        <div className="absolute inset-0 border-4 border-green-500/50 rounded-xl pointer-events-none animate-pulse" />
                    )}
                </div>

                {/* Optional Transcript Panel */}
                <AnimatePresence>
                    {showTranscript && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-slate-800 border-l border-slate-700 h-full rounded-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-700 font-semibold text-slate-300">Transcript</div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-600">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <span className="text-xs text-slate-500 mb-1 capitalize">{m.role}</span>
                                        <div className={`px-3 py-2 rounded-lg max-w-[90%] ${m.role === 'user' ? 'bg-blue-600/20 text-blue-200' : 'bg-slate-700 text-slate-300'}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6 px-4">
                <button className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                    <Video className="w-6 h-6" />
                </button>

                {status === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:scale-105"
                    >
                        <Mic className="w-6 h-6" />
                    </button>
                )}

                {status === 'listening' && (
                    <button
                        onClick={stopRecording}
                        className="p-4 rounded-full bg-slate-700 border-2 border-red-500 text-red-500 animate-pulse"
                    >
                        <Square className="w-6 h-6 fill-current" />
                    </button>
                )}

                {(status === 'processing' || status === 'speaking') && (
                    <button disabled className="p-4 rounded-full bg-slate-800 text-slate-500 cursor-not-allowed">
                        <MicOff className="w-6 h-6" />
                    </button>
                )}

                <button onClick={() => window.location.reload()} className="p-4 rounded-full bg-red-900/20 hover:bg-red-900/40 text-red-500 transition-colors">
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
// Helper for Square icon since it wasn't imported initially in my mind but it is in lucide
import { Square } from 'lucide-react';

export default InterviewSession;
