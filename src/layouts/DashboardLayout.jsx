import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    FiPlus,
    FiMessageSquare,
    FiFileText,
    FiSearch,
    FiSettings,
    FiUser,
    FiLogOut,
    FiX
} from "react-icons/fi";

export default function DashboardLayout({ children, activeTab, setActiveTab, history = [] }) {
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
    };

    const menuItems = [
        { id: "dashboard", label: "AI Chat Workspace", icon: FiMessageSquare },
        { id: "documents", label: "Documents Hub", icon: FiFileText },
        { id: "search", label: "Web Search", icon: FiSearch },
    ];

    const bottomItems = [
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "settings", label: "Settings", icon: FiSettings },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                history={history}
            />

            {/* Mobile Sidebar/Drawer Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black z-40 md:hidden"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 p-4 flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                                <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                                    ☕ LLM COFFEE
                                </span>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <button
                                onClick={() => { setActiveTab("new-chat"); setIsMobileOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                            >
                                <FiPlus className="text-lg" />
                                <span className="text-sm">New Chat</span>
                            </button>

                            <nav className="flex-1 space-y-1.5 overflow-y-auto">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group ${
                                                isActive
                                                    ? "bg-slate-800 text-amber-400 font-medium border border-slate-700/50"
                                                    : "hover:bg-slate-800/50 hover:text-slate-100"
                                            }`}
                                        >
                                            <Icon className={`text-lg ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                            <span className="text-sm">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="pt-4 border-t border-slate-800 space-y-1">
                                {bottomItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group ${
                                                isActive
                                                    ? "bg-slate-800 text-amber-400 font-medium border border-slate-700/50"
                                                    : "hover:bg-slate-800/50 hover:text-slate-100"
                                            }`}
                                        >
                                            <Icon className={`text-lg ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                            <span className="text-sm">{item.label}</span>
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer group"
                                >
                                    <FiLogOut className="text-lg text-slate-400 group-hover:text-red-400" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Right Pane */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar
                    onMenuClick={() => setIsMobileOpen(true)}
                    activeTab={activeTab}
                    isSidebarCollapsed={isCollapsed}
                />
                
                {/* Main Viewport Content */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}