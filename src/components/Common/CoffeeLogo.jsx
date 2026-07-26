import { motion } from "framer-motion";

export default function CoffeeLogo({ size = "md", showText = true, className = "" }) {
    const isSmall = size === "sm";
    const isLarge = size === "lg";

    const iconSizeClass = isSmall ? "w-7 h-7 text-sm" : isLarge ? "w-11 h-11 text-2xl" : "w-9 h-9 text-lg";
    const textSizeClass = isSmall ? "text-xs" : isLarge ? "text-lg" : "text-sm";

    return (
        <motion.div
            className={`flex items-center gap-2.5 select-none ${className}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {/* Coffee Icon Container with Soft Glow, Floating & Breathing */}
            <motion.div
                whileHover={{ rotate: -5, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-850 to-slate-900 border border-amber-500/25 animate-pulse-glow animate-float ${iconSizeClass} shadow-lg cursor-pointer`}
            >
                {/* Subtle Rising Steam Lines */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-end gap-[3px] pointer-events-none overflow-visible">
                    <span className="w-[1.5px] h-3 bg-gradient-to-t from-amber-400/80 to-transparent rounded-full animate-steam-1" />
                    <span className="w-[1.5px] h-3.5 bg-gradient-to-t from-amber-300/80 to-transparent rounded-full animate-steam-2" />
                </div>

                {/* Signature Coffee Cup */}
                <span className="relative z-10 animate-breathe filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]">
                    ☕
                </span>
            </motion.div>

            {/* Brand Text with Premium Gradient */}
            {showText && (
                <div className="flex flex-col justify-center">
                    <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`font-black tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent ${textSizeClass} font-sans leading-none`}
                    >
                        LLM COFFEE
                    </motion.span>
                    {!isSmall && (
                        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500 mt-0.5">
                            AI Workspace
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
