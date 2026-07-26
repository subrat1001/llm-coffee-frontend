import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register as registerApi } from "../api/auth";
import toast from "react-hot-toast";

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            await registerApi({ username, email, password });
            toast.success("Account created successfully! Please log in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Registration failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 relative overflow-hidden">
            {/* Glowing background details */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative">
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent"
                        >
                            ☕ LLM COFFEE
                        </motion.h1>
                        <p className="text-slate-400 mt-2 text-sm">Brewing intelligence, one cup at a time.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Username</label>
                            <input
                                type="text"
                                placeholder="coffeesnob"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-600 transition-all outline-none"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-600 transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-600 transition-all outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-amber-400 hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}