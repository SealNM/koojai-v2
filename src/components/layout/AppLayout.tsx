'use client';

import Sidebar from './Sidebar';

/**
 * 🎨 AppLayout - Main Application Layout
 * ใช้สำหรับหน้าที่ต้องการ Sidebar (หลัง login)
 */

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0d1a]">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
