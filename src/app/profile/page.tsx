'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { 
  ChevronLeftIcon, 
  UserIcon, 
  LockIcon,
  LogOutIcon,
  SaveIcon,
  CheckIcon,
  XIcon,
} from '@/components/ui/Icons';

/**
 * 👤 ProfilePage - Modern Dark Theme
 * ดีไซน์แบบ BeeBot/TalkMosaic
 */

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const result = await response.json();
      if (result.success) {
        setSaveMessage('บันทึกสำเร็จ');
        setIsSuccess(true);
      } else {
        setSaveMessage(result.message || 'เกิดข้อผิดพลาด');
        setIsSuccess(false);
      }
    } catch {
      setSaveMessage('เกิดข้อผิดพลาด');
      setIsSuccess(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage('รหัสผ่านใหม่ไม่ตรงกัน');
      setPasswordSuccess(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setPasswordSuccess(false);
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();
      if (result.success) {
        setPasswordMessage('เปลี่ยนรหัสผ่านสำเร็จ');
        setPasswordSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(result.message || 'เกิดข้อผิดพลาด');
        setPasswordSuccess(false);
      }
    } catch {
      setPasswordMessage('เกิดข้อผิดพลาด');
      setPasswordSuccess(false);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">โปรไฟล์</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>
          </div>

          {/* User Info Card */}
          <Card variant="gradient" padding="lg" className="mb-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-blue-100 dark:text-blue-200">{user?.student_id}</p>
                <p className="text-sm text-blue-200/70 dark:text-blue-300/70">
                  {user?.grade_level} {user?.classroom && `ห้อง ${user.classroom}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              ข้อมูลส่วนตัว
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'password'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              <LockIcon className="w-5 h-5" />
              เปลี่ยนรหัสผ่าน
            </button>
          </div>

          {/* Tab Content */}
          <Card variant="default" padding="lg">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <Input
                  label="ชื่อเล่น"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="ใส่ชื่อเล่นของคุณ"
                />

                <Input
                  label="อีเมล"
                  value={user?.email || ''}
                  disabled
                  className="opacity-60"
                />

                {saveMessage && (
                  <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                    isSuccess 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {isSuccess ? <CheckIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                    {saveMessage}
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  leftIcon={<SaveIcon className="w-5 h-5" />}
                  className="w-full"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-5">
                <Input
                  label="รหัสผ่านเดิม"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  leftIcon={<LockIcon className="w-5 h-5" />}
                />

                <Input
                  label="รหัสผ่านใหม่"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<LockIcon className="w-5 h-5" />}
                />

                <Input
                  label="ยืนยันรหัสผ่านใหม่"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<LockIcon className="w-5 h-5" />}
                />

                {passwordMessage && (
                  <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                    passwordSuccess 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {passwordSuccess ? <CheckIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                    {passwordMessage}
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleChangePassword}
                  isLoading={isChangingPassword}
                  leftIcon={<LockIcon className="w-5 h-5" />}
                  className="w-full"
                >
                  {isChangingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                </Button>
              </div>
            )}
          </Card>

          {/* Logout Button */}
          <Button
            variant="danger"
            onClick={handleLogout}
            leftIcon={<LogOutIcon className="w-5 h-5" />}
            className="w-full mt-6"
          >
            ออกจากระบบ
          </Button>
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
