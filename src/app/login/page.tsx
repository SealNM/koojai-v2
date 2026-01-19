'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, ThemeToggle } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const result = await login(identifier, password, false);
      if (result.success) {
        // Redirect to home (which will be character list)
        router.push('/'); 
      } else {
        setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative overflow-hidden transition-colors duration-300">
        {/* Header with Theme Toggle */}
        <header className="absolute top-0 right-0 p-6 z-50">
            <ThemeToggle />
        </header>

         {/* Decorative Background */ }
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-8 overflow-hidden"
                    >
                        <Image 
                            src="/images/brand/koojai-logo.png" 
                            alt="KooJai Logo" 
                            width={48} 
                            height={48}
                            className="w-12 h-12 object-contain"
                        />
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display, var(--font-sans))' }}>
                        ยินดีต้อนรับ
                    </h1>
                    <p className="text-muted-foreground text-lg">เข้าสู่ระบบเพื่อพูดคุยกับ KooJai</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            leftIcon={<Mail className="w-5 h-5" />}
                            placeholder="ชื่อผู้ใช้ / อีเมล"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="text-lg py-6"
                        />
                        <Input
                            leftIcon={<Lock className="w-5 h-5" />}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-primary transition-colors p-1">
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            }
                            type={showPassword ? 'text' : 'password'}
                            placeholder="รหัสผ่าน"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="text-lg py-6"
                        />
                    </div>

                    {error && (
                         <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm text-center font-medium"
                         >
                            {error}
                         </motion.div>
                    )}

                    <Button 
                        type="submit" 
                        fullWidth 
                        size="xl" 
                        isLoading={isLoading}
                        className="text-lg font-bold rounded-2xl"
                    >
                        เข้าสู่ระบบ
                    </Button>
                </form>

                {/* Teacher Login Link */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    เข้าสู่ระบบสำหรับคุณครู?
                  </p>
                  <Link
                    href="/teacher/login"
                    className="text-sm text-primary hover:text-primary/80 transition font-medium"
                  >
                    เข้าสู่ระบบคุณครู/ผู้ดูแล →
                  </Link>
                </div>
            </motion.div>
        </div>
    </div>
  );
}
