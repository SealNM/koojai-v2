'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Compass, 
  Plus, 
  User, 
  X,
  Settings,
  Sparkles,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { id: '/', icon: Compass, label: 'หน้าหลัก' },
    // { id: '/chat', icon: MessageCircle, label: 'ประวัติแชท' },
    { id: '/characters/create', icon: Plus, label: 'สร้างใหม่' },
    { id: '/profile', icon: User, label: 'โปรไฟล์' },
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        className={cn(
            "fixed md:relative inset-y-0 left-0 z-50 w-[280px] md:translate-x-0 h-full",
            "bg-transparent md:block" 
        )}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      >
        <div className="flex flex-col h-full bg-card border-r border-border backdrop-blur-xl transition-colors duration-300">
          {/* Branding */}
          <div className="flex-none p-6 pt-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-kanit">KooJai</h1>
            
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden ml-auto p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden font-kanit",
                  isActive(item.id) 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive(item.id) && "animate-pulse-slow")} />
                <span className="text-base">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer / User Profile */}
          <div className="flex-none p-4 m-4 bg-secondary/50 rounded-3xl border border-border/50">
             <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/50 dark:hover:bg-black/20 p-2 rounded-xl transition-colors" onClick={() => router.push('/profile')}>
                <Avatar name={user?.name || 'User'} className="w-10 h-10 border-2 border-background shadow-sm" />
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground truncate font-kanit">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground truncate opacity-80">Online</p>
                </div>
             </div>
             
             {/* Redesigned Actions Area */}
             <div className="flex items-center gap-2">
                <div className="flex-1">
                    <ThemeToggle variant="switch" />
                </div>
                <Button 
                    variant="danger" 
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl shadow-sm"
                    onClick={logout}
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
             </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
