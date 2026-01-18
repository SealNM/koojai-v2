'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PublicRoute from '@/components/PublicRoute';

// Icons
const TeacherIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="50" rx="4" fill="white" stroke="white" strokeWidth="3"/>
    <rect x="40" y="70" width="20" height="15" fill="white"/>
    <rect x="30" y="85" width="40" height="5" rx="2" fill="white"/>
    <circle cx="50" cy="42" r="12" fill="#1E293B"/>
    <path d="M35 55 Q50 65 65 55" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

function TeacherLoginForm() {
  const router = useRouter();
  const { loginTeacher } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginTeacher(email, password);
      
      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-brand-dark relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-30 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-30 blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center relative z-10 border border-slate-100 dark:border-slate-700">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 p-5">
            <TeacherIcon />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Teacher Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-light">ระบบสำหรับคุณครูและผู้ดูแล</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
              อีเมล
            </label>
            <input
              type="email"
              placeholder="teacher@school.ac.th"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:outline-none transition-all text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่าน"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:outline-none transition-all text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white text-lg font-semibold py-4 rounded-2xl transition duration-200 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/30
              ${isLoading ? 'bg-emerald-300 dark:bg-emerald-800 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>กำลังเข้าสู่ระบบ...</span>
              </span>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        {/* Student Login Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <Link
            href="/login"
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
          >
            ← กลับไปหน้า Login นักเรียน
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <PublicRoute>
      <TeacherLoginForm />
    </PublicRoute>
  );
}
