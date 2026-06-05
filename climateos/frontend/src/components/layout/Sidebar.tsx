import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, MapPin, CloudSun, Lightbulb, TreePine,
  History, BarChart3, Settings, ChevronLeft, Leaf,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/locations', icon: MapPin, label: 'Locations' },
  { to: '/forecast', icon: CloudSun, label: 'Forecast' },
  { to: '/recommendations', icon: Lightbulb, label: 'Smart Insights' },
  { to: '/trees/analyze', icon: TreePine, label: 'Tree Analysis' },
  { to: '/trees/history', icon: History, label: 'Tree History' },
  { to: '/usage', icon: BarChart3, label: 'Usage & Quota' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-surface-50/80 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3 border-b border-white/5 p-5">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-dim to-accent shadow-glow-sm"
        >
          <Leaf className="h-5 w-5 text-surface" />
        </motion.div>
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="font-display text-lg font-bold tracking-tight">ClimateOS</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Weather & Forestry</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-accent/10 text-accent-glow'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl border border-accent/20 bg-accent/5"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={clsx('relative h-5 w-5 shrink-0', isActive && 'text-accent')} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="m-3 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 p-2.5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
      >
        <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
          <ChevronLeft className="h-4 w-4" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
