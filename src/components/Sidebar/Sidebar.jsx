import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import CoffeeLogo from "../Common/CoffeeLogo";
import {
    FiPlus,
    FiMessageSquare,
    FiFileText,
    FiSearch,
    FiSettings,
    FiUser,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiBookmark,
    FiCpu,
    FiHardDrive
} from "react-icons/fi";

export default function Sidebar({ isCollapsed, setIsCollapsed, activeTab, setActiveTab, history = [] }) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
    };

    // Get unique recent query topics
    const recentQueries = Array.from(new Set(history.map(item => item.question)))
        .slice(-3)
        .reverse();

    const pinnedItems = [
        { id: "workspace-guide", label: "LLM Coffee Guide", topic: "Explain what LLM Coffee is and how to use it" },
        { id: "rag-guide", label: "Semantic Search Q&A", topic: "How does the RAG vector store process my documents?" }
    ];

    const mainNav = [
        { id: "dashboard", label: "AI Chat Workspace", icon: FiMessageSquare },
        { id: "documents", label: "Documents Hub", icon: FiFileText },
        { id: "search", label: "Web Search", icon: FiSearch },
    ];

    const bottomNav = [
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "settings", label: "Settings", icon: FiSettings },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 68 : 260 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="hidden md:flex flex-col h-screen bg-slate-900 border-r border-slate-800/80 text-slate-400 relative z-30 flex-shrink-0"
        >
            {/* Sidebar Toggle button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 p-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-200 transition-colors z-40 shadow-md cursor-pointer hidden md:block"
            >
                {isCollapsed ? <FiChevronRight className="text-xs" /> : <FiChevronLeft className="text-xs" />}
            </motion.button>

            {/* Top Logo */}
            <div className="flex items-center justify-center md:justify-start h-16 px-4 border-b border-slate-800/60 overflow-hidden">
                <CoffeeLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
            </div>

            {/* New Chat Button */}
            <div className="p-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab("new-chat")}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 hover:border-slate-600 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                        isCollapsed ? "justify-center px-0" : ""
                    }`}
                    title="New Chat"
                >
                    <FiPlus className="text-sm flex-shrink-0" />
                    {!isCollapsed && <span>New Chat</span>}
                </motion.button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
                {/* Main Views */}
                <div className="space-y-0.5">
                    {mainNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer group ${
                                    isActive
                                        ? "bg-slate-850 text-slate-100 font-semibold shadow-sm"
                                        : "hover:bg-slate-850/50 hover:text-slate-200"
                                }`}
                            >
                                <Icon className={`text-md ${isActive ? 'text-amber-400 animate-pulse-glow' : 'text-slate-500 group-hover:text-slate-350'}`} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Pinned Items */}
                {!isCollapsed && pinnedItems.length > 0 && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <FiBookmark className="text-[9px]" /> Pinned Chats
                        </div>
                        <div className="space-y-0.5">
                            {pinnedItems.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        toast.success(`Loaded pinned topic`);
                                        setActiveTab("dashboard");
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 cursor-pointer text-left truncate group"
                                >
                                    <FiMessageSquare className="text-[10px] text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Items */}
                {!isCollapsed && recentQueries.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Recent Conversions
                        </div>
                        <div className="space-y-0.5">
                            {recentQueries.map((q, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        toast.success("Resumed query topic");
                                        setActiveTab("dashboard");
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 cursor-pointer text-left truncate group"
                                >
                                    <FiMessageSquare className="text-[10px] text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{q}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Configs */}
            <div className="p-3 border-t border-slate-800/60 space-y-2">
                {/* Secondary navigation */}
                <div className="space-y-0.5">
                    {bottomNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer group ${
                                    isActive
                                        ? "bg-slate-850 text-slate-100 font-semibold shadow-sm"
                                        : "hover:bg-slate-850/50 hover:text-slate-200"
                                }`}
                            >
                                <Icon className={`text-md ${isActive ? 'text-amber-400 animate-pulse-glow' : 'text-slate-500 group-hover:text-slate-350'}`} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </motion.button>
                        );
                    })}
                    <motion.button
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer group"
                    >
                        <FiLogOut className="text-md text-slate-500 group-hover:text-red-400 flex-shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </motion.button>
                </div>

                {/* User avatar card */}
                <div className="flex items-center gap-3 px-1 py-1 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-slate-200 text-xs flex-shrink-0">
                        CL
                    </div>
                    {!isCollapsed && (
                        <div className="text-left truncate">
                            <p className="text-xs font-semibold text-slate-300 truncate">Coffee Lover</p>
                            <p className="text-[10px] text-slate-600 truncate">coffee@example.com</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}