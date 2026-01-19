'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Lock, 
  LogOut, 
  Save, 
  Shield, 
  AlertCircle,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  // Profile Form States
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const result = await response.json();
      if (result.success) {
        setSaveStatus('success');
        setSaveMessage('Profile updated successfully');
      } else {
        setSaveStatus('error');
        setSaveMessage(result.message || 'Failed to update profile');
      }
    } catch {
      setSaveStatus('error');
      setSaveMessage('An unexpected error occurred');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus('idle');

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();
      if (result.success) {
        setPasswordStatus('success');
        setPasswordMessage('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus('error');
        setPasswordMessage(result.message || 'Failed to change password');
      }
    } catch {
      setPasswordStatus('error');
      setPasswordMessage('An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <AppLayout>
      <div className="flex-1 bg-background p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">โปรไฟล์ของฉัน</h1>
            <p className="text-muted-foreground">จัดการบัญชีและการตั้งค่าของคุณ</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: User Card & Menu */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4 group cursor-pointer">
                   <Avatar 
                      name={user?.nickname || user?.first_name || 'User'} 
                      size="xl" 
                      className="w-24 h-24 ring-2 ring-border"
                   />
                   <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-500 rounded-full text-white group-hover:bg-indigo-600 transition-colors">
                      <Camera className="w-4 h-4" />
                   </div>
                </div>
                
                <h2 className="text-xl font-bold text-foreground">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  รหัสนักเรียน: {user?.student_id}
                </p>
                
                <Badge variant="primary" className="mb-6">นักเรียน</Badge>
                
                <div className="w-full space-y-2">
                  <Button 
                    variant={activeTab === 'details' ? 'primary' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('details')}
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    ข้อมูลส่วนตัว
                  </Button>
                  <Button 
                    variant={activeTab === 'security' ? 'primary' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('security')}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    ความปลอดภัย
                  </Button>
                </div>

                <div className="w-full pt-6 mt-6 border-t border-border">
                  <Button 
                    variant="danger" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    ออกจากระบบ
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Settings Forms */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">ข้อมูลส่วนตัว</h3>
                          <p className="text-sm text-muted-foreground">อัปเดตข้อมูลโปรไฟล์สาธารณะของคุณ</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">ชื่อจริง</label>
                            <Input value={user?.first_name || ''} disabled className="bg-muted opacity-75" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">นามสกุล</label>
                            <Input value={user?.last_name || ''} disabled className="bg-muted opacity-75" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">รหัสนักเรียน</label>
                          <Input value={user?.student_id || ''} disabled className="bg-muted opacity-75 font-mono" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">ชื่อเล่น</label>
                          <Input 
                            placeholder="คุณอยากให้เรียกว่าอะไร?" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value)}
                          />
                          <p className="text-xs text-slate-500 mt-2">นี่คือชื่อที่ KooJai จะใช้เรียกคุณ</p>
                        </div>

                        {saveStatus !== 'idle' && (
                           <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${saveStatus === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                             {saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                             {saveMessage}
                           </div>
                        )}

                        <div className="pt-4 flex justify-end">
                          <Button 
                            onClick={handleSaveProfile} 
                            isLoading={isSaving}
                            leftIcon={<Save className="w-4 h-4" />}
                          >
                            บันทึกการเปลี่ยนแปลง
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div 
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 md:p-8">
                       <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">ความปลอดภัย</h3>
                          <p className="text-sm text-muted-foreground">จัดการรหัสผ่านและการตั้งค่าความปลอดภัย</p>
                        </div>
                      </div>

                      <div className="space-y-6 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">รหัสผ่านปัจจุบัน</label>
                          <Input 
                            type="password" 
                            placeholder="กรอกรหัสผ่านปัจจุบัน"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">รหัสผ่านใหม่</label>
                          <Input 
                             type="password" 
                             placeholder="กรอกรหัสผ่านใหม่"
                             value={newPassword}
                             onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                          <Input 
                             type="password" 
                             placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                             value={confirmPassword}
                             onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>

                        {passwordStatus !== 'idle' && (
                           <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordStatus === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                             {passwordStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                             {passwordMessage}
                           </div>
                        )}

                        <div className="pt-4 flex justify-end">
                           <Button 
                              onClick={handleChangePassword} 
                              isLoading={isChangingPassword}
                              leftIcon={<Lock className="w-4 h-4" />}
                           >
                              เปลี่ยนรหัสผ่าน
                           </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedUserTypes={['student']}>
       <ProfileContent />
    </ProtectedRoute>
  );
}
