'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MenuIcon } from '@/components/ui/Icons';
import { ThemeIconToggle } from '@/components/ui/ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  title?: string;
  showHeader?: boolean;
  headerRight?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true,
  title,
  showHeader = true,
  headerRight,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 dark:bg-brand-dark overflow-hidden">
      
      {/* Sidebar - Desktop always visible, Mobile as drawer */}
      {showSidebar && (
        <div className="hidden md:block">
          <Sidebar isOpen={true} setIsOpen={() => {}} />
        </div>
      )}
      
      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="md:hidden">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full relative flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        {showHeader && (
          <header className="flex-none h-16 px-4 flex items-center justify-between gap-4 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 md:hidden z-20">
            <div className="flex items-center gap-3">
              {showSidebar && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-slate-600 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
              )}
              {title && (
                <h1 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeIconToggle />
              {headerRight}
            </div>
          </header>
        )}

        {/* Page Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

// Simple Page Layout (without sidebar - for chat, login, etc.)
interface SimpleLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-[100dvh] w-full bg-slate-50 dark:bg-brand-dark ${className}`}>
      {children}
    </div>
  );
};

export default AppLayout;
