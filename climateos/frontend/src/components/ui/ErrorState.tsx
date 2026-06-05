import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center"
    >
      <div className="rounded-full bg-red-400/10 p-3">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <p className="text-sm text-white/70">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </motion.div>
  );
}
