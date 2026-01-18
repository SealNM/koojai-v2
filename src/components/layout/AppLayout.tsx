'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/components/ui';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
      
      {/* Sidebar - Desktop */}
      {showSidebar && (
        <div className="hidden md:block h-full">
          <Sidebar isOpen={true} setIsOpen={() => {}} />
        </div>
      )}

      {/* Mobile Sidebar (controlled by state) */}
      {showSidebar && (
         <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full relative flex flex-col min-w-0 overflow-hidden bg-background">
        
        {/* Mobile Header */}
        <header className="flex-none h-16 px-4 flex items-center justify-between gap-4 border-b md:hidden bg-background">
            <div className="flex items-center gap-3">
              {showSidebar && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <h1 className="font-bold text-lg text-foreground">KooJai</h1>
            </div>
            
            <ThemeToggle />
        </header>

        {children}
      </main>
    </div>
  );
};
