import { motion } from "framer-motion";

export default function Skeleton({ className = "h-4 w-full rounded-md", count = 1, gap = "gap-2.5" }) {
    if (count === 1) {
        return (
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`animate-shimmer rounded-lg bg-slate-800/80 border border-slate-750/50 ${className}`}
            />
        );
    }

    return (
        <div className={`flex flex-col ${gap}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className={`animate-shimmer rounded-lg bg-slate-800/80 border border-slate-750/50 ${className}`}
                    style={{ width: i === count - 1 && count > 1 ? "75%" : "100%" }}
                />
            ))}
        </div>
    );
}
