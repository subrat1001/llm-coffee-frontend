import { motion } from "framer-motion";

export default function ThinkingIndicator({ text = "Brewing response..." }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-lg shadow-amber-500/5 w-fit my-2"
        >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs animate-pulse-glow">
                ☕
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300 tracking-wide font-sans">{text}</span>
                <div className="flex items-center gap-1 ml-1">
                    {[0, 1, 2].map((dot) => (
                        <motion.span
                            key={dot}
                            animate={{
                                y: ["0%", "-50%", "0%"],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: dot * 0.15
                            }}
                            className="w-1.5 h-1.5 rounded-full bg-amber-400"
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
