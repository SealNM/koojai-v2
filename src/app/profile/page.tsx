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
      <div className="flex-1 bg-slate-50 dark:bg-[#0f0d1a] p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Profile</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: User Card & Menu */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4 group cursor-pointer">
                   <Avatar 
                      name={user?.nickname || user?.first_name || 'User'} 
                      size="xl" 
                      className="w-24 h-24 ring-4 ring-slate-100 dark:ring-slate-800"
                   />
                   <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-500 rounded-full text-white ring-2 ring-white dark:ring-slate-900 group-hover:bg-indigo-600 transition-colors">
                      <Camera className="w-4 h-4" />
                   </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  Student ID: {user?.student_id}
                </p>
                
                <Badge variant="primary" className="mb-6">Student</Badge>
                
                <div className="w-full space-y-2">
                  <Button 
                    variant={activeTab === 'details' ? 'primary' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('details')}
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    Personal Details
                  </Button>
                  <Button 
                    variant={activeTab === 'security' ? 'primary' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('security')}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    Security
                  </Button>
                </div>

                <div className="w-full pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button 
                    variant="danger" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
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
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Update your public profile information</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                            <Input value={user?.first_name || ''} disabled className="bg-slate-50 dark:bg-slate-900/50 opacity-75" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                            <Input value={user?.last_name || ''} disabled className="bg-slate-50 dark:bg-slate-900/50 opacity-75" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID</label>
                          <Input value={user?.student_id || ''} disabled className="bg-slate-50 dark:bg-slate-900/50 opacity-75 font-mono" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nickname</label>
                          <Input 
                            placeholder="How should we call you?" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value)}
                          />
                          <p className="text-xs text-slate-500 mt-2">This is the name KooJai will use to talk to you.</p>
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
                            Save Changes
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
                       <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and security settings</p>
                        </div>
                      </div>

                      <div className="space-y-6 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                          <Input 
                            type="password" 
                            placeholder="Enter current password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                          <Input 
                             type="password" 
                             placeholder="Enter new password"
                             value={newPassword}
                             onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                          <Input 
                             type="password" 
                             placeholder="Confirm new password"
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
                              Update Password
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
