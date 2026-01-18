'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('student' | 'teacher')[];
}

/**
 * 🛡️ ProtectedRoute Component
 * ตรวจสอบว่า user login แล้วหรือยัง และมีสิทธิ์เข้าถึงหน้านี้ไหม
 */
export default function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['student', 'teacher'] 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user && !allowedUserTypes.includes(user.user_type)) {
        // ถ้าไม่มีสิทธิ์ redirect ไปหน้าที่เหมาะสม
        if (user.user_type === 'teacher') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/mood');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedUserTypes, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ login หรือไม่มีสิทธิ์ แสดง loading (รอ redirect)
  if (!isAuthenticated || (user && !allowedUserTypes.includes(user.user_type))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
