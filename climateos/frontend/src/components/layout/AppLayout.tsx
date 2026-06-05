import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { useGeoDetect } from '@/hooks/useGeoDetect';

export function AppLayout() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  useGeoDetect();

  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar />
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen p-6 lg:p-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
