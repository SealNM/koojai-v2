'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// --- Icons ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 88C50 88 12 65 12 40C12 22 26 12 38 14C45 15 50 20 50 20C50 20 55 15 62 14C74 12 88 22 88 40C88 65 50 88 50 88Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="35" cy="42" r="4.5" fill="#1E293B" />
    <circle cx="65" cy="42" r="4.5" fill="#1E293B" />
    <path d="M43 52Q50 58 57 52" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
    <circle cx="26" cy="48" r="5" fill="#FECACA" opacity="0.8" />
    <circle cx="74" cy="48" r="5" fill="#FECACA" opacity="0.8" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// --- Navbar Component ---

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setIsProfileDropdownOpen(false);
  };

  const navLinks = [
    { name: 'หน้าหลัก', path: '/', icon: <HomeIcon /> },
    { name: 'เพื่อนคู่ใจ', path: '/characters', icon: <span className="text-lg">🎭</span> },
  ];

  // Active link logic
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center space-x-3 group outline-none"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center p-2.5 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 duration-300">
                <HeartIcon />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-slate-800 text-2xl tracking-tight leading-none group-hover:text-blue-600 transition-colors">KooJai</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">AI Companion</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => router.push(link.path)}
                    className={`
                      relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2.5
                      ${active 
                        ? 'text-blue-700 bg-blue-50/80' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }
                    `}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                    {active && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: User & Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Desktop Profile Dropdown */}
            <div className="hidden md:block relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`
                  flex items-center space-x-3 pl-1 pr-3 py-1.5 rounded-full border transition-all duration-200 group
                  ${isProfileDropdownOpen ? 'border-blue-200 bg-blue-50/50 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}
                `}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 border border-white shadow-sm group-hover:scale-105 transition-transform">
                  <UserIcon />
                </div>
                <div className="flex flex-col items-start pr-1">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">
                    {user?.nickname || user?.first_name || 'นักเรียน'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Student</span>
                </div>
                <div className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''} text-slate-400`}>
                  <ChevronDownIcon />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 py-2 animate-slide-up origin-top-right border border-slate-100 z-50">
                  <div className="px-5 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.nickname || user?.first_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.student_id}</p>
                  </div>
                  
                  <div className="px-2 py-1">
                    <button
                      onClick={() => { router.push('/profile'); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-left font-medium"
                    >
                      <UserIcon />
                      <span>จัดการโปรไฟล์</span>
                    </button>
                    {/* Add more menu items here if needed */}
                  </div>

                  <div className="my-1 border-t border-slate-50 mx-2"></div>

                  <div className="px-2 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogoutIcon />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors bg-slate-50 hover:text-blue-600 active:bg-slate-200"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
           <div 
             className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl overflow-y-auto animate-slide-left flex flex-col"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center p-2 shadow-sm">
                     <HeartIcon />
                   </div>
                   <div>
                    <span className="font-bold text-slate-800 text-lg block leading-tight">KooJai</span>
                    <span className="text-xs text-slate-500">AI Companion</span>
                   </div>
                 </div>
                 <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white hover:shadow-sm transition-all"
                 >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="flex-1 p-6 space-y-8">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">เมนูหลัก</p>
                   <div className="space-y-2">
                      {navLinks.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => { router.push(link.path); setIsMobileMenuOpen(false); }}
                          className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 border ${
                            isActive(link.path) 
                              ? 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm' 
                              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className={isActive(link.path) ? 'text-blue-600' : 'text-slate-400'}>{link.icon}</span>
                          <span className="text-base font-medium">{link.name}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">บัญชีของคุณ</p>
                   <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-4">
                      <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                              <UserIcon />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.nickname || user?.first_name || 'นักเรียน'}</p>
                            <p className="text-xs text-slate-500 truncate">จัดการบัญชีส่วนตัว</p>
                          </div>
                      </div>
                      <button
                        onClick={() => { router.push('/profile'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                      >
                         <span>ตั้งค่าโปรไฟล์</span>
                      </button>
                   </div>
                   
                   <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all font-medium"
                   >
                     <LogoutIcon />
                     <span>ออกจากระบบ</span>
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </nav>
  );
}
