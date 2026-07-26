import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import CoffeeLogo from "../Common/CoffeeLogo";
import {
    FiMenu,
    FiBell,
    FiMoon,
    FiSun,
    FiMonitor,
    FiCheck,
    FiChevronDown,
    FiLogOut,
    FiUser,
    FiSettings,
    FiCpu,
    FiWifi
} from "react-icons/fi";

export default function Navbar({ onMenuClick, activeTab, isSidebarCollapsed }) {
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
    };

    const getWorkspaceTitle = () => {
        switch (activeTab) {
            case "chats":
                return "Chat History";
            case "documents":
                return "Documents Hub";
            case "search":
                return "AI Web Search";
            case "settings":
                return "Settings";
            case "profile":
                return "Profile Details";
            case "new-chat":
                return "New Workspace Chat";
            default:
                return "LLM COFFEE Workspace";
        }
    };

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800/80 text-slate-100 flex items-center justify-between px-4 md:px-6 z-20 relative">
            {/* Left Section: Mobile Menu + Workspace Title */}
            <div className="flex items-center gap-3">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 md:hidden transition-colors cursor-pointer"
                >
                    <FiMenu className="text-xl" />
                </motion.button>

                {isSidebarCollapsed && (
                    <div className="hidden md:flex items-center gap-2">
                        <CoffeeLogo size="sm" showText={true} />
                        <div className="h-4 w-px bg-slate-850 mx-2" />
                    </div>
                )}

                <h2 className="text-sm md:text-sm font-semibold text-slate-250 tracking-wide font-sans">
                    {getWorkspaceTitle()}
                </h2>
            </div>

            {/* Right Section: Actions & Live Status */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/60 border border-slate-850 rounded-lg text-[10px] text-slate-400 font-mono">
                    <FiWifi className="text-emerald-500 animate-pulse" />
                    <span>Connected</span>
                </div>

                {/* Theme Toggle Dropdown */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 transition-colors cursor-pointer flex items-center justify-center"
                        title={`Current Theme: ${theme}`}
                    >
                        {theme === 'light' ? (
                            <FiSun className="text-xs text-amber-500 animate-spin-slow" />
                        ) : theme === 'system' ? (
                            <FiMonitor className="text-xs text-blue-400" />
                        ) : (
                            <FiMoon className="text-xs text-amber-400" />
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showThemeMenu && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowThemeMenu(false)} />

                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-40 space-y-0.5"
                                >
                                    <div className="px-2.5 py-1 border-b border-slate-800/80 mb-1">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Theme Mode</p>
                                    </div>

                                    <button
                                        onClick={() => { setTheme("dark"); setShowThemeMenu(false); toast.success("Theme switched to Dark Mode"); }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${theme === "dark" ? "bg-amber-500/15 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"}`}
                                    >
                                        <span className="flex items-center gap-2"><FiMoon className="text-xs" /> Dark</span>
                                        {theme === "dark" && <FiCheck className="text-xs" />}
                                    </button>

                                    <button
                                        onClick={() => { setTheme("light"); setShowThemeMenu(false); toast.success("Theme switched to Light Mode"); }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${theme === "light" ? "bg-amber-500/15 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"}`}
                                    >
                                        <span className="flex items-center gap-2"><FiSun className="text-xs" /> Light</span>
                                        {theme === "light" && <FiCheck className="text-xs" />}
                                    </button>

                                    <button
                                        onClick={() => { setTheme("system"); setShowThemeMenu(false); toast.success("Theme set to System Default"); }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${theme === "system" ? "bg-amber-500/15 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"}`}
                                    >
                                        <span className="flex items-center gap-2"><FiMonitor className="text-xs" /> System</span>
                                        {theme === "system" && <FiCheck className="text-xs" />}
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications Bell */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toast.success("No new notifications")}
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 transition-colors relative cursor-pointer"
                    title="Notifications"
                >
                    <FiBell className="text-xs" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors text-left outline-none cursor-pointer"
                    >
                        <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs animate-pulse-glow">
                            CL
                        </div>
                        <FiChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />

                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-40"
                                >
                                    <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1">
                                        <p className="text-[10px] text-slate-500">Workspace</p>
                                        <p className="text-xs font-semibold text-slate-200 truncate">LLM COFFEE Workspace</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ x: 2 }}
                                        onClick={() => { setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-450 hover:text-slate-200 hover:bg-slate-850/80 transition-colors cursor-pointer"
                                    >
                                        <FiUser className="text-xs" />
                                        Profile
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ x: 2 }}
                                        onClick={() => { setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-450 hover:text-slate-200 hover:bg-slate-850/80 transition-colors cursor-pointer"
                                    >
                                        <FiSettings className="text-xs" />
                                        Settings
                                    </motion.button>

                                    <div className="h-px bg-slate-800/80 my-1" />

                                    <motion.button
                                        whileHover={{ x: 2 }}
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <FiLogOut className="text-xs" />
                                        Logout
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}