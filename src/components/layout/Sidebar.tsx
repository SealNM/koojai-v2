'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  HomeIcon,
  UsersIcon,
  HistoryIcon,
  CompassIcon,
  SettingsIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  PlusIcon,
  ChevronDownIcon,
  SearchIcon,
  KooJaiIcon,
  SunIcon,
  MoonIcon,
} from '@/components/ui/Icons';
import Avatar from '@/components/ui/Avatar';

/**
 * 🎨 Sidebar - Modern Dark Theme Navigation
 * ดีไซน์แบบ BeeBot/TalkMosaic
 */

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { name: 'หน้าหลัก', path: '/', icon: <HomeIcon /> },
  { name: 'สำรวจ', path: '/characters', icon: <CompassIcon /> },
  { name: 'เพื่อนคู่ใจ', path: '/chat', icon: <UsersIcon /> },
  { name: 'ประวัติ', path: '/history', icon: <HistoryIcon /> },
];

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setIsProfileOpen(false);
    if (isProfileOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Recent Chats (mock data - replace with real data)
  const recentChats = [
    { id: 1, title: 'วันนี้รู้สึกยังไงบ้าง...' },
    { id: 2, title: 'เรื่องที่โรงเรียน...' },
    { id: 3, title: 'อยากเล่าให้ฟัง...' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
            <KooJaiIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-foreground text-lg block leading-tight">KooJai</span>
            <span className="text-[10px] text-foreground-muted font-medium uppercase tracking-wider">AI Companion</span>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="w-full pl-10 pr-4 py-2.5 bg-background-secondary border border-border rounded-xl text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 mb-6">
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/20'
                    : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                  }
                `}
              >
                <span className={active ? 'text-blue-500 dark:text-blue-400' : ''}>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 px-3 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-3">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            บทสนทนาล่าสุด
          </span>
        </div>
        <div className="space-y-1">
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => router.push('/chat')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors truncate"
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Toggle & New Chat Button */}
      <div className="p-4 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-background-secondary hover:bg-background-tertiary text-foreground-secondary rounded-xl transition-colors border border-border"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <SunIcon className="w-4 h-4" />
              <span className="text-sm">เปลี่ยนเป็นโหมดสว่าง</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4" />
              <span className="text-sm">เปลี่ยนเป็นโหมดมืด</span>
            </>
          )}
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => router.push('/chat')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          <PlusIcon className="w-5 h-5" />
          <span>เริ่มแชทใหม่</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileOpen(!isProfileOpen);
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background-secondary transition-colors"
          >
            <Avatar
              src={user?.profile_image_url}
              name={user?.first_name || user?.nickname || 'User'}
              size="md"
              status="online"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.nickname || user?.first_name || 'นักเรียน'}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {user?.student_id || 'Student'}
              </p>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-foreground-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-card border border-border rounded-xl shadow-xl overflow-hidden animate-scale-in">
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground-secondary hover:bg-background-secondary transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>ตั้งค่าโปรไฟล์</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-background-card lg:border-r lg:border-border lg:backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <KooJaiIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground">KooJai</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-background-secondary"
            >
              {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-background-card border-r border-border animate-slide-in-left">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
