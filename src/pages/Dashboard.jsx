import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { sendChatQuery, getChatHistory, clearChatHistory } from "../api/chat";
import { listDocuments, uploadDocument, deleteDocument, getDocumentStats } from "../api/documents";
import api from "../api/api";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CoffeeLogo from "../components/Common/CoffeeLogo";
import ThinkingIndicator from "../components/Common/ThinkingIndicator";
import Skeleton from "../components/Common/Skeleton";
import {
    FiSend,
    FiUploadCloud,
    FiCpu,
    FiSearch,
    FiUser,
    FiTrash2,
    FiInfo,
    FiCopy,
    FiRefreshCw,
    FiStopCircle,
    FiFileText,
    FiDatabase,
    FiServer,
    FiHardDrive,
    FiPaperclip,
    FiMic,
    FiThumbsUp,
    FiThumbsDown,
    FiLock,
    FiActivity,
    FiGlobe,
    FiCode,
    FiLayers,
    FiCompass,
    FiZap
} from "react-icons/fi";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            sender: "ai",
            text: "# Welcome to LLM COFFEE ☕\n\nI am your intelligent local AI assistant, powered by local inference. Use the attachment button to inject documents into my FAISS semantic database, or select a quick action below to start brewing solutions.",
            timestamp: new Date().toISOString(),
            liked: null
        }
    ]);
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    // AI Router Panel Stats
    const [activeRoute, setActiveRoute] = useState("LLM");
    const [responseTime, setResponseTime] = useState(0);
    const [retrievalStatus, setRetrievalStatus] = useState("Idle");

    // Documents & Stats State
    const [documentsList, setDocumentsList] = useState([]);
    const [stats, setStats] = useState({
        total_documents: 0,
        total_embeddings: 0,
        storage_used: 0,
        last_upload_time: 0,
        index_status: "Empty"
    });

    // Upload queue tracking
    const [uploadQueue, setUploadQueue] = useState([]);

    // System Health Status
    const [healthStatus, setHealthStatus] = useState({
        status: "loading",
        postgresql: "loading",
        ollama: "loading",
        tavily: "loading",
        version: "1.0.0"
    });

    const [settingsTab, setSettingsTab] = useState("general"); // "general" or "system"

    // Last user question for regeneration
    const [lastQuestion, setLastQuestion] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognitionInstance, setRecognitionInstance] = useState(null);
    const [isDraggingOverChat, setIsDraggingOverChat] = useState(false);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    const abortControllerRef = useRef(null);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const placeholders = [
        "Ask a question or reference documents...",
        "Summarise a PDF report in 3 bullet points...",
        "Explain quantum computing in simple terms...",
        "Write a Python script to scrape web data...",
        "Search the web for 2026 technology trends..."
    ];

    const quickActions = [
        { title: "Explain AI", prompt: "Explain the core principles of artificial intelligence and LLMs in simple terms.", icon: FiZap, desc: "Fundamental concepts & architecture" },
        { title: "Summarise a PDF", prompt: "Summarise the main points of my uploaded document in 3 concise bullet points.", icon: FiFileText, desc: "Condense long reports & papers" },
        { title: "Search the Web", prompt: "Search for the latest 2026 technology trends and advancements.", icon: FiGlobe, desc: "Real-time web retrieval" },
        { title: "Generate Python Code", prompt: "Write a clean, production-ready Python script to scrape a webpage using BeautifulSoup.", icon: FiCode, desc: "Production-ready code snippets" },
        { title: "Analyse Documents", prompt: "Analyze the key findings and data from my attached FAISS knowledge repository.", icon: FiLayers, desc: "Deep dive into vector index" },
        { title: "Brainstorm Ideas", prompt: "Brainstorm 5 innovative product features and workflows for a modern AI workspace.", icon: FiCompass, desc: "Creative solutions & strategies" },
    ];

    const handleQuickAction = (promptText) => {
        setInput(promptText);
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    };

    const toggleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        if (isListening && recognitionInstance) {
            recognitionInstance.stop();
            setIsListening(false);
            toast.success("Voice recording stopped");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
                toast.success("Listening... Speak now into your microphone");
            };

            recognition.onresult = (event) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript + " ";
                    }
                }
                if (currentTranscript) {
                    setInput((prev) => (prev ? prev.trim() + " " + currentTranscript.trim() : currentTranscript.trim()));
                }
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    toast.error("Microphone permission denied. Please allow microphone access in browser settings.");
                } else {
                    toast.error(`Voice input error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
            setRecognitionInstance(recognition);
        } catch (err) {
            setIsListening(false);
            toast.error("Could not initialize voice input.");
        }
    };

    // Fetch history from DB
    const fetchHistory = async () => {
        try {
            const data = await getChatHistory();
            setHistory(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch documents and stats
    const fetchDocumentsAndStats = async () => {
        try {
            const docs = await listDocuments();
            setDocumentsList(docs);
            const docStats = await getDocumentStats();
            setStats(docStats);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch system health status
    const fetchSystemHealth = async () => {
        try {
            const res = await api.get("/health");
            setHealthStatus(res.data);
        } catch (err) {
            console.error(err);
            setHealthStatus({
                status: "degraded",
                postgresql: "offline",
                ollama: "offline",
                tavily: "offline",
                version: "1.0.0"
            });
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchHistory();
        fetchDocumentsAndStats();
        fetchSystemHealth();
        
        const healthInterval = setInterval(fetchSystemHealth, 15000);
        return () => clearInterval(healthInterval);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Auto expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [input]);

    // Rotating placeholder animation
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [placeholders.length]);

    // Send query wrapper
    const triggerQuery = async (queryText) => {
        setIsLoading(true);
        setRetrievalStatus("Evaluating...");
        setLastQuestion(queryText);
        
        const startTime = Date.now();
        abortControllerRef.current = new AbortController();

        try {
            const data = await sendChatQuery(queryText);
            const latency = Date.now() - startTime;
            setResponseTime(latency);

            // Deduce route from query & context
            let routeMatched = "LLM";
            const lowerQ = queryText.toLowerCase();
            if (lowerQ.includes("today") || lowerQ.includes("news") || lowerQ.includes("weather")) {
                routeMatched = "WEB";
            } else if (lowerQ.includes("document") || lowerQ.includes("pdf") || lowerQ.includes("uploaded")) {
                routeMatched = "RAG";
            }
            if (data.context && data.context.length > 0) {
                routeMatched = lowerQ.includes("today") || lowerQ.includes("news") ? "BOTH" : "RAG";
            }
            setActiveRoute(routeMatched);
            setRetrievalStatus(data.context && data.context.length > 0 ? "Context Found" : "No Match");

            // Append AI response
            setMessages((prev) => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    sender: "ai",
                    text: data.answer || data.response || "No response received.",
                    timestamp: data.created_at || new Date().toISOString(),
                    context: data.context || [],
                    liked: null
                }
            ]);

            // context matches are rendered in bubbles
            
            fetchHistory();
        } catch (err) {
            if (err.name !== "AbortError" && err.name !== "CanceledError") {
                toast.error("Failed to fetch response. Make sure backend is running.");
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `err-${Date.now()}`,
                        sender: "ai",
                        text: "⚠️ **Connection Error:** Could not reach the inference engine.",
                        timestamp: new Date().toISOString(),
                        liked: null
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessageText = input.trim();
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        setMessages((prev) => [
            ...prev,
            {
                id: `user-${Date.now()}`,
                sender: "user",
                text: userMessageText,
                timestamp: new Date().toISOString()
            }
        ]);

        await triggerQuery(userMessageText);
    };

    const handleStopResponse = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!lastQuestion || isLoading) return;
        setMessages((prev) => [
            ...prev,
            {
                id: `user-regen-${Date.now()}`,
                sender: "user",
                text: `🔄 *Regenerate:* "${lastQuestion}"`,
                timestamp: new Date().toISOString()
            }
        ]);
        await triggerQuery(lastQuestion);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to delete all chat history?")) {
            try {
                await clearChatHistory();
                toast.success("Chat history cleared");
                setMessages([
                    {
                        id: "welcome",
                        sender: "ai",
                        text: "Welcome to LLM COFFEE Workspace ☕. Chat archive cleared.",
                        timestamp: new Date().toISOString(),
                        liked: null
                    }
                ]);
                setHistory([]);
                setActiveRoute("LLM");
                setResponseTime(0);
            } catch (err) {
                console.error(err);
                toast.error("Failed to clear history");
            }
        }
    };

    const handleLikeToggle = (msgId, likedState) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === msgId) {
                return { ...msg, liked: msg.liked === likedState ? null : likedState };
            }
            return msg;
        }));
        toast.success(likedState ? "Feedback captured!" : "Response reported.");
    };

    // File Upload Handler
    const handleFileUpload = async (files) => {
        const validExtensions = ["pdf", "docx", "txt"];
        const maxSize = 10 * 1024 * 1024; // 10MB

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split(".").pop().toLowerCase();

            if (!validExtensions.includes(fileExt)) {
                toast.error(`Invalid extension: ${file.name}. Only PDF, DOCX, TXT allowed.`);
                continue;
            }

            if (file.size > maxSize) {
                toast.error(`File size exceeds 10MB: ${file.name}`);
                continue;
            }

            // eslint-disable-next-line react-hooks/purity
            const queueId = `${file.name}-${Date.now()}`;
            const newQueueItem = {
                id: queueId,
                filename: file.name,
                progress: 0,
                status: "uploading",
                rawFile: file,
                cancelToken: null
            };

            setUploadQueue((prev) => [...prev, newQueueItem]);

            const formData = new FormData();
            formData.append("file", file);

            try {
                await uploadDocument(formData, (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadQueue((prev) =>
                        prev.map((item) =>
                            item.id === queueId ? { ...item, progress: percentCompleted } : item
                        )
                    );
                });

                setUploadQueue((prev) =>
                    prev.map((item) =>
                        item.id === queueId ? { ...item, status: "completed", progress: 100 } : item
                    )
                );
                toast.success(`Uploaded ${file.name} successfully!`);
                fetchDocumentsAndStats();
            } catch (err) {
                console.error(err);
                setUploadQueue((prev) =>
                    prev.map((item) =>
                        item.id === queueId ? { ...item, status: "error" } : item
                    )
                );
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    };

    const handleRetryUpload = (queueItem) => {
        setUploadQueue((prev) => prev.filter((item) => item.id !== queueItem.id));
        handleFileUpload([queueItem.rawFile]);
    };

    const handleCancelUpload = (queueId) => {
        setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
        toast.error("Upload cancelled");
    };

    const handleDeleteDoc = async (filename) => {
        if (window.confirm(`Are you sure you want to delete ${filename}? This will remove it from FAISS embeddings.`)) {
            try {
                await deleteDocument(filename);
                toast.success("Document deleted successfully");
                fetchDocumentsAndStats();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete document");
            }
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="flex flex-col h-[calc(100vh-6.5rem)] overflow-hidden">
                        {/* Left Main Workspace */}
                        <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden h-full shadow-lg relative">
                            {/* Header details */}
                            <div className="px-6 py-3.5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-xs text-slate-400 font-medium">Session Active (Local Inference)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isLoading && (
                                        <button
                                            onClick={handleStopResponse}
                                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <FiStopCircle /> Stop Response
                                        </button>
                                    )}
                                    {lastQuestion && !isLoading && (
                                        <button
                                            onClick={handleRegenerate}
                                            className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                                            title="Regenerate Last Answer"
                                        >
                                            <FiRefreshCw className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Main Chat Feed */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => {
                                        const isAi = msg.sender === "ai";
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.25, ease: "easeOut" }}
                                                className={`flex gap-4 max-w-4xl ${!isAi ? "ml-auto justify-end" : ""}`}
                                            >
                                                {isAi && (
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-800 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm animate-pulse-glow" title="LLM Coffee AI">
                                                        ☕
                                                    </div>
                                                )}
                                                <div className={`group relative max-w-[85%] rounded-2xl px-4.5 py-3 border text-sm leading-relaxed transition-all ${
                                                    isAi
                                                        ? "bg-slate-900/50 border-slate-800 text-slate-350 shadow-sm hover:border-slate-750"
                                                        : "bg-slate-900 border-slate-800 text-slate-200 shadow-sm"
                                                }`}>
                                                    <div className="prose prose-invert max-w-none text-slate-300">
                                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                    </div>

                                                    {/* Context references */}
                                                    {isAi && msg.context && msg.context.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
                                                            <p className="font-semibold text-slate-400 flex items-center gap-1"><FiInfo /> Vector matches:</p>
                                                            <ul className="list-disc pl-4 space-y-0.5">
                                                                {msg.context.map((c, i) => (
                                                                    <li key={i} className="truncate max-w-lg" title={c}>{c}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Bottom controls / Timestamp */}
                                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] text-slate-600 font-mono">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.15 }}
                                                                whileTap={{ scale: 0.85 }}
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(msg.text);
                                                                    toast.success("Copied to clipboard");
                                                                }}
                                                                className="text-slate-500 hover:text-slate-250 cursor-pointer p-0.5 rounded"
                                                                title="Copy response"
                                                            >
                                                                <FiCopy className="text-[10px]" />
                                                            </motion.button>
                                                            {isAi && (
                                                                <>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() => handleLikeToggle(msg.id, true)}
                                                                        className={`p-0.5 rounded cursor-pointer ${msg.liked === true ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                                                                    >
                                                                        <FiThumbsUp className="text-[10px]" />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() => handleLikeToggle(msg.id, false)}
                                                                        className={`p-0.5 rounded cursor-pointer ${msg.liked === false ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                                                                    >
                                                                        <FiThumbsDown className="text-[10px]" />
                                                                    </motion.button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isAi && (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-800 text-slate-450 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                                                        ME
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {messages.length <= 1 && (
                                    <div className="mt-8 mb-4">
                                        <div className="text-center mb-6">
                                            <h3 className="text-base font-bold text-slate-200 tracking-wide mb-1 flex items-center justify-center gap-2">
                                                <span>⚡ Quick Actions</span>
                                            </h3>
                                            <p className="text-xs text-slate-400">Select a prompt template to automatically insert into the input below</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {quickActions.map((action, idx) => {
                                                const IconComponent = action.icon;
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleQuickAction(action.prompt)}
                                                        className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                                                <IconComponent className="text-sm" />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{action.title}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 line-clamp-2">{action.prompt}</p>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="flex gap-4 max-w-xl">
                                        <ThinkingIndicator text="Brewing intelligent response..." />
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat input box */}
                            <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
                                {/* Voice Listening Banner */}
                                <AnimatePresence>
                                    {isListening && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: "auto" }}
                                            exit={{ opacity: 0, y: 10, height: 0 }}
                                            className="flex items-center justify-between px-4 py-2 bg-red-500/15 border border-red-500/40 rounded-xl mb-3 text-xs text-red-400 shadow-lg shadow-red-500/10"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                                <span className="font-semibold tracking-wide">Listening to speech... speak clearly into microphone</span>
                                            </div>
                                            <button
                                                onClick={toggleVoiceInput}
                                                className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                                            >
                                                Stop Recording
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingOverChat(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingOverChat(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingOverChat(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                            handleFileUpload(e.dataTransfer.files);
                                        }
                                    }}
                                    className={`relative bg-slate-900 border focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500/60 rounded-2xl p-2.5 transition-all shadow-lg focus-within:shadow-amber-500/5 ${isDraggingOverChat ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50' : 'border-slate-800'}`}
                                >
                                    {isDraggingOverChat && (
                                        <div className="absolute inset-0 z-20 bg-slate-950/90 rounded-2xl flex items-center justify-center border-2 border-dashed border-amber-500/80 text-amber-400 font-bold text-xs gap-2 backdrop-blur-sm">
                                            <FiUploadCloud className="text-lg animate-bounce" />
                                            <span>Drop file to attach to chat!</span>
                                        </div>
                                    )}

                                    <textarea
                                        ref={textareaRef}
                                        rows={1}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholders[placeholderIdx]}
                                        disabled={isLoading}
                                        className="w-full bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 text-xs px-3 py-1.5 resize-none max-h-40 focus:ring-0 disabled:opacity-40 leading-relaxed"
                                    />
                                    
                                    {/* Action buttons */}
                                    <div className="flex justify-between items-center px-2 mt-2 pt-2 border-t border-slate-800/60">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                multiple
                                                ref={fileInputRef}
                                                onChange={(e) => handleFileUpload(e.target.files)}
                                                className="hidden"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors relative"
                                                title="Attach Document (PDF, DOCX, TXT)"
                                            >
                                                <FiPaperclip className="text-xs" />
                                                {stats.total_documents > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 font-bold text-[8px] rounded-full flex items-center justify-center">
                                                        {stats.total_documents}
                                                    </span>
                                                )}
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={toggleVoiceInput}
                                                className={`p-2 rounded-lg cursor-pointer transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/60'}`}
                                                title={isListening ? "Stop Voice Recognition" : "Voice Input (Speech recognition)"}
                                            >
                                                <FiMic className="text-xs" />
                                            </motion.button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-slate-500 font-mono tracking-wider hidden sm:inline">
                                                {input.length} chars
                                            </span>
                                            <motion.button
                                                whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
                                                whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
                                                onClick={handleSend}
                                                disabled={isLoading || !input.trim()}
                                                className="py-1.5 px-3.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 disabled:bg-slate-800/80 disabled:text-slate-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-amber-500/10 disabled:shadow-none"
                                            >
                                                <span>Send</span>
                                                <FiSend className="text-[11px]" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "documents":
                return (
                    <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 max-w-4xl flex flex-col h-[calc(100vh-7rem)] overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                                    <FiFileText className="text-amber-400" /> Knowledge Repository
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">Manage documents parsed into embeddings inside the FAISS vector index.</p>
                            </div>
                            <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-350">
                                Total: {documentsList.length} files
                            </div>
                        </div>

                        {/* Drag Zone */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleFileUpload(e.dataTransfer.files);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-slate-800 hover:border-amber-500/40 bg-slate-950/40 rounded-xl p-6 text-center cursor-pointer group transition-all mb-4"
                        >
                            <FiUploadCloud className="text-3xl text-slate-650 group-hover:text-amber-450 mx-auto mb-2 transition-colors group-hover:scale-110 duration-200 transform" />
                            <p className="text-xs text-slate-300 font-medium">Drop document or browse</p>
                            <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, and TXT files</p>
                        </motion.div>

                        {/* Active upload queues */}
                        {uploadQueue.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <AnimatePresence>
                                    {uploadQueue.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-3 bg-slate-950/80 border border-slate-855 rounded-xl space-y-2 text-xs"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-200 truncate font-medium">{item.filename}</span>
                                                <span className="font-mono text-amber-400">{item.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.progress}%` }}
                                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className={`font-semibold ${item.status === "completed" ? "text-emerald-400" : item.status === "error" ? "text-red-400" : "text-amber-400 animate-pulse"}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                                <div className="flex gap-3">
                                                    {item.status === "error" && (
                                                        <button onClick={() => handleRetryUpload(item)} className="text-amber-450 hover:underline cursor-pointer">Retry</button>
                                                    )}
                                                    {item.status === "uploading" && (
                                                        <button onClick={() => handleCancelUpload(item.id)} className="text-red-400 hover:underline cursor-pointer">Cancel</button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {documentsList.length === 0 ? (
                            <div className="border border-slate-800/65 rounded-xl p-12 text-center bg-slate-955/20 text-slate-500 text-sm flex-1 flex flex-col justify-center items-center">
                                <FiFileText className="text-3xl text-slate-700 mb-3" />
                                <p>No documents uploaded yet.</p>
                                <p className="text-xs text-slate-650 mt-1">Upload a PDF, DOCX, or TXT file using the upload dropzone above.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                                {documentsList.map((doc) => (
                                    <div key={doc.filename} className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/5 border border-amber-500/10 text-amber-400 rounded-lg">
                                                <FiFileText className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-200 truncate w-60 md:w-96" title={doc.filename}>{doc.filename}</p>
                                                <p className="text-[9px] text-slate-500 mt-0.5">Size: {formatBytes(doc.size)} | Modified: {new Date(doc.upload_time * 1000).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDoc(doc.filename)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Document"
                                        >
                                            <FiTrash2 className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "search":
                return (
                    <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 max-w-xl space-y-4">
                        <FiSearch className="text-3xl text-amber-400" />
                        <h3 className="text-md font-bold text-slate-200 uppercase tracking-wider">AI Search Module</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Web routing utilizes Tavily web scraping libraries. When search-related questions are posed, search query tokens are dispatched in real-time.
                        </p>
                        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-slate-450">Tavily Engine Status</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                            </span>
                        </div>
                    </div>
                );
            case "settings":
                return (
                    <div className="max-w-5xl h-[calc(100vh-7rem)] overflow-y-auto pb-6 space-y-6">
                        {/* Sub-navigation for Settings */}
                        <div className="flex border-b border-slate-800/80 gap-6 pb-3">
                            <button
                                onClick={() => setSettingsTab("general")}
                                className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                                    settingsTab === "general"
                                        ? "border-amber-400 text-amber-400"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <FiUser className="text-base" />
                                <span>General Profile</span>
                            </button>
                            <button
                                onClick={() => setSettingsTab("system")}
                                className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                                    settingsTab === "system"
                                        ? "border-amber-400 text-amber-400"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <FiActivity className="text-base" />
                                <span>System Information</span>
                            </button>
                        </div>

                        {settingsTab === "general" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profile details */}
                                <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                        <FiUser className="text-amber-400" /> User profile details
                                    </h3>
                                    <div className="space-y-4 text-xs">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                value="Coffee Lover"
                                                readOnly
                                                className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-850 text-slate-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value="coffee@example.com"
                                                readOnly
                                                className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-850 text-slate-450 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => toast.success("Configuration locks are active")}
                                            className="py-1.5 px-3 bg-amber-500 text-slate-955 font-bold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer text-xs"
                                        >
                                            Change Profile Details
                                        </button>
                                    </div>
                                </div>

                                {/* Build / Version info */}
                                <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <FiHardDrive className="text-amber-400" /> Build details
                                        </h3>
                                        <div className="space-y-2.5 text-xs text-slate-400">
                                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                                                <span>Application Version</span>
                                                <span className="font-mono text-slate-200">v{healthStatus.version}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-800/40 mb-2">
                                                <span>Default UI Theme</span>
                                                <span className="text-amber-400 font-bold uppercase">SaaS Dark</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-850">
                                        <button
                                            onClick={handleClearHistory}
                                            className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Clear Chat Archive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1: AI Model & Ollama Status */}
                                <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                                            <FiCpu className="text-amber-400" /> AI Model & Routing
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1">Language model inference engine and active router metrics.</p>
                                    </div>
                                    <div className="space-y-3 text-xs text-slate-400 pt-3 border-t border-slate-800/40">
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                                            <span>AI Model</span>
                                            <span className="text-slate-200 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">qwen2.5</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                                            <span>Ollama Status</span>
                                            <span className={`font-semibold text-xs flex items-center gap-1.5 ${healthStatus.ollama === "online" ? 'text-emerald-400' : 'text-red-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.ollama === "online" ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                {healthStatus.ollama === "online" ? 'Online & Ready' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                                            <span>Active Route</span>
                                            <span className="text-amber-400 font-bold uppercase">{activeRoute}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5">
                                            <span>Inference Latency</span>
                                            <span className="text-slate-200 font-semibold">{responseTime}ms</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Vector Database & Storage */}
                                <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                                            <FiHardDrive className="text-amber-400" /> Vector DB & Storage
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1">FAISS semantic index memory footprint and document embeddings.</p>
                                    </div>
                                    <div className="space-y-3 pt-3 border-t border-slate-800/40">
                                        <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800/40">
                                            <span className="text-slate-400">Vector Database</span>
                                            <span className="text-slate-200 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">FAISS FlatL2</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                                            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl">
                                                <p className="text-slate-500 text-[9px] mb-0.5 uppercase tracking-wider font-semibold">Docs count</p>
                                                <p className="text-slate-200 font-bold text-sm">{stats.total_documents}</p>
                                            </div>
                                            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl">
                                                <p className="text-slate-500 text-[9px] mb-0.5 uppercase tracking-wider font-semibold">FAISS Vectors</p>
                                                <p className="text-slate-200 font-bold text-sm">{stats.total_embeddings}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs px-3">
                                            <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Memory Storage Used</span>
                                            <span className="text-amber-400 font-bold font-mono">{formatBytes(stats.storage_used)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Backend Health & System Info */}
                                <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <FiServer className="text-amber-400" /> System Health & API
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1">Backing microservices, database connectivity, and runtime environment.</p>
                                    </div>
                                    
                                    {healthStatus.status === "loading" ? (
                                        <Skeleton count={3} className="h-10 w-full rounded-xl" gap="gap-3" />
                                    ) : (
                                        <div className="space-y-2.5 text-xs pt-3 border-t border-slate-800/40">
                                            <div className="p-2.5 bg-slate-955 border border-slate-850 rounded-xl flex items-center justify-between">
                                                <span className="text-slate-400 font-medium flex items-center gap-2">
                                                    <FiActivity className="text-emerald-400" /> Backend Health
                                                </span>
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                                                </span>
                                            </div>

                                            <div className="p-2.5 bg-slate-955 border border-slate-850 rounded-xl flex items-center justify-between">
                                                <span className="text-slate-400 font-medium flex items-center gap-2">
                                                    <FiDatabase className="text-blue-400" /> Database Status
                                                </span>
                                                <span className={`font-semibold flex items-center gap-1.5 ${healthStatus.postgresql === "online" ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.postgresql === "online" ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {healthStatus.postgresql === "online" ? 'PostgreSQL Online' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="p-2.5 bg-slate-955 border border-slate-850 rounded-xl flex items-center justify-between">
                                                <span className="text-slate-400 font-medium flex items-center gap-2">
                                                    <FiSearch className="text-purple-400" /> API Status
                                                </span>
                                                <span className={`font-semibold flex items-center gap-1.5 ${healthStatus.tavily === "configured" ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.tavily === "configured" ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {healthStatus.tavily === "configured" ? 'Tavily Search Active' : 'Tavily Key Missing'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500 font-mono px-1">
                                                <span>Env: Production/Local</span>
                                                <span>v{healthStatus.version}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "profile":
                return (
                    <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 max-w-xl space-y-4">
                        <FiUser className="text-3xl text-amber-400" />
                        <h3 className="text-md font-bold text-slate-200 uppercase tracking-wider">User profile credentials</h3>
                        <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3.5 text-xs text-slate-400">
                            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                                <span>Username</span>
                                <span className="text-slate-200 font-semibold">Coffee Lover</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                                <span>Email Account</span>
                                <span className="text-slate-200 font-semibold">coffee@example.com</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span>Security Level</span>
                                <span className="text-amber-400 font-semibold uppercase flex items-center gap-1"><FiLock className="text-[10px]" /> Admin</span>
                            </div>
                        </div>
                    </div>
                );
            case "new-chat":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-8 max-w-md mx-auto text-center space-y-4 mt-12 shadow-lg"
                    >
                        <div className="flex justify-center mb-2">
                            <CoffeeLogo size="lg" showText={false} />
                        </div>
                        <h3 className="text-md font-bold text-slate-200 uppercase tracking-wider">Start a fresh conversation</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Resets the local query context structures and initializes a brand new AI workspace session.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                setMessages([
                                    {
                                        id: "welcome",
                                        sender: "ai",
                                        text: "# Welcome to LLM COFFEE ☕\nContext reset complete. Send a prompt to begin brewing ideas in a fresh workspace.",
                                        timestamp: new Date().toISOString(),
                                        liked: null
                                    }
                                ]);
                                setActiveRoute("LLM");
                                setResponseTime(0);
                                setActiveTab("dashboard");
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-955 font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md shadow-amber-500/20"
                        >
                            Open Chat Workspace
                        </motion.button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} history={history}>
            {renderContent()}
        </DashboardLayout>
    );
}