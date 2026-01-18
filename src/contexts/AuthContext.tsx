'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/types';

/**
 * 🔐 AuthContext
 * React Context สำหรับจัดการ Authentication State ทั้งแอพ
 */

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // ฟังก์ชันต่างๆ
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  loginTeacher: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตรวจสอบ session เมื่อเปิดแอพ
  useEffect(() => {
    checkExistingSession();
  }, []);

  // ฟังก์ชันตรวจสอบ session ที่มีอยู่
  const checkExistingSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชัน refresh user data
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // ฟังก์ชัน Login สำหรับนักเรียน
  const login = async (identifier: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
      }

      return { success: false, message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    }
  };

  // ฟังก์ชัน Login สำหรับครู
  const loginTeacher = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
      }

      return { success: false, message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    }
  };

  // ฟังก์ชัน Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // ฟังก์ชันอัพเดท user
  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginTeacher,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook สำหรับใช้งาน AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
