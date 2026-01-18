'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CompassIcon, 
  PlusIcon, 
  UserIcon, 
  XIcon,
  SettingsIcon,
  KooJaiIcon,
} from '@/components/ui/Icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { id: '/', icon: CompassIcon, label: 'สำรวจ' },
    { id: '/characters/create', icon: PlusIcon, label: 'สร้างใหม่' },
    { id: '/profile', icon: UserIcon, label: 'โปรไฟล์' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/characters';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed md:relative z-50 w-64 h-full 
          bg-white dark:bg-brand-surface 
          border-r border-slate-200 dark:border-white/5 
          flex flex-col
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between h-20 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-gradient shadow-lg shadow-brand-purple/30 flex items-center justify-center">
              <KooJaiIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              KooJai
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-2 text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-400 dark:text-brand-gray/50 uppercase tracking-wider mb-3">
            เมนู
          </p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group
                ${isActive(item.id) 
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25 translate-x-1' 
                  : 'text-slate-600 dark:text-brand-gray hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.id) ? 'text-white' : 'text-slate-400 dark:text-brand-gray group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-slate-600 dark:text-brand-gray">ธีม</span>
            <ThemeToggle size="sm" />
          </div>
          
          <button 
            onClick={() => handleNavigate('/profile')} 
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-lime flex items-center justify-center text-white font-bold text-lg">
              {user?.nickname?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {user?.nickname || user?.first_name || 'ผู้ใช้'}
              </div>
              <div className="text-xs text-slate-500 dark:text-brand-gray truncate">
                {user?.student_id || 'นักเรียน'}
              </div>
            </div>
            <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-brand-gray" />
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
