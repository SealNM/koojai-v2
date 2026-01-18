'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PublicRoute from '@/components/PublicRoute';
import { Button, Input } from '@/components/ui';
import { KooJaiIcon, UserIcon, LockIcon, ArrowRightIcon } from '@/components/ui/Icons';

/**
 * 🎨 Login Page - Modern Dark Theme
 * ดีไซน์แบบ TalkMosaic
 */

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(identifier, password, rememberMe);
      
      if (result.success) {
        router.push('/mood');
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
    <div className="min-h-screen w-full flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#0f172a]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          {/* Decorative Grid */}
          <div className="absolute inset-0 grid grid-cols-3 gap-4 -z-10 opacity-50">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`
                  rounded-3xl aspect-square
                  ${i % 3 === 1 ? 'bg-blue-400' : 'bg-blue-500/30'}
                  ${i === 4 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : ''}
                `}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="text-center relative z-10 mt-32">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/30">
              <KooJaiIcon className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              คุยกับ AI<br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">ในทุกเรื่อง</span>
            </h1>
            
            <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">
              สร้างเพื่อนคู่ใจที่เข้าใจคุณ<br />
              พร้อมรับฟังทุกเรื่องราว
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/25">
              <KooJaiIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KooJai</h1>
            <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">เพื่อนคู่ใจ AI</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ยินดีต้อนรับกลับ</h2>
              <p className="text-gray-500 dark:text-slate-500">เข้าสู่ระบบเพื่อเริ่มพูดคุย</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="รหัสนักเรียน หรือ อีเมล"
                placeholder="เช่น 65001 หรือ somchai@school.ac.th"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<UserIcon className="w-5 h-5" />}
                disabled={isLoading}
                required
              />

              <Input
                label="รหัสผ่าน"
                type="password"
                placeholder="รหัสผ่านของคุณ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<LockIcon className="w-5 h-5" />}
                disabled={isLoading}
                required
              />

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                      {rememberMe && (
                        <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
                    จำการเข้าสู่ระบบ
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRightIcon className="w-5 h-5" />}
              >
                เข้าสู่ระบบ
              </Button>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 dark:text-slate-600 mt-6">
              การเข้าสู่ระบบถือว่าคุณยอมรับ{' '}
              <span className="text-blue-500 hover:underline cursor-pointer">เงื่อนไขการใช้งาน</span>
              {' '}และ{' '}
              <span className="text-blue-500 hover:underline cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            </p>
          </div>

          {/* Teacher Login Link */}
          <div className="mt-8 text-center">
            <Link
              href="/teacher/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <span>สำหรับคุณครู (Teacher Login)</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
}
