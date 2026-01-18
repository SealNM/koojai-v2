'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * 🌐 PublicRoute Component  
 * สำหรับหน้าที่เข้าถึงได้เฉพาะเมื่อยังไม่ login
 * ถ้า login แล้วจะ redirect ไปหน้าหลัก
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.user_type === 'teacher') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/mood');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // ถ้า login แล้ว แสดง loading (รอ redirect)
  if (isAuthenticated) {
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
