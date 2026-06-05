import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-12"
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
      <p className="text-sm text-white/50">{message}</p>
    </motion.div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card animate-pulse p-6 ${className}`}>
      <div className="mb-4 h-4 w-1/3 rounded-lg bg-white/10" />
      <div className="mb-2 h-8 w-1/2 rounded-lg bg-white/10" />
      <div className="h-3 w-2/3 rounded-lg bg-white/5" />
    </div>
  );
}
