import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, hover = true, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={clsx('glass-card', hover && 'glass-card-hover', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
