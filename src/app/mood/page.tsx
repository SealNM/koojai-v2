'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MoodEntry } from '@/types';
import { SmileIcon, MehIcon, FrownIcon, CloudIcon, ZapIcon, ArrowRightIcon, KooJaiIcon } from '@/components/ui/Icons';

/**
 * 🎨 MoodPage - Modern Dark Theme
 * หน้าเลือกอารมณ์ก่อนเริ่มแชท - ดีไซน์แบบ TalkMosaic
 */

const moods = [
  { 
    mood: 'happy', 
    icon: SmileIcon, 
    label: 'มีความสุข', 
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    iconColor: 'text-emerald-400',
    bgHover: 'hover:bg-emerald-500/10'
  },
  { 
    mood: 'neutral', 
    icon: MehIcon, 
    label: 'เฉยๆ', 
    color: 'from-slate-500/20 to-gray-500/20',
    borderColor: 'border-slate-500/30 hover:border-slate-400',
    iconColor: 'text-slate-400',
    bgHover: 'hover:bg-slate-500/10'
  },
  { 
    mood: 'tired', 
    icon: CloudIcon, 
    label: 'เหนื่อย', 
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    iconColor: 'text-blue-400',
    bgHover: 'hover:bg-blue-500/10'
  },
  { 
    mood: 'sad', 
    icon: FrownIcon, 
    label: 'เศร้า', 
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30 hover:border-violet-400',
    iconColor: 'text-violet-400',
    bgHover: 'hover:bg-violet-500/10'
  },
  { 
    mood: 'angry', 
    icon: ZapIcon, 
    label: 'หงุดหงิด', 
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/30 hover:border-red-400',
    iconColor: 'text-red-400',
    bgHover: 'hover:bg-red-500/10'
  },
];

function MoodSelector() {
  const router = useRouter();
  const { user } = useAuth();

  const handleMoodSelect = async (mood: MoodEntry['mood']) => {
    if (!user?.student_id) return;

    try {
      // บันทึกอารมณ์ผ่าน API
      await fetch('/api/mood/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.student_id,
          mood,
        }),
      });
    } catch (error) {
      console.error('Error saving mood:', error);
    }

    // ไปหน้าแชทพร้อมส่ง mood ไปด้วย
    router.push(`/chat?mood=${mood}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#0f172a]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/25 animate-float">
            <KooJaiIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            สวัสดี {user?.nickname || user?.first_name || 'เพื่อน'} 👋
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-lg">วันนี้รู้สึกยังไงบ้าง?</p>
          <p className="text-gray-400 dark:text-slate-600 text-sm mt-2">บอกให้เรารู้หน่อยนะ</p>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {moods.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.mood}
                onClick={() => handleMoodSelect(m.mood as MoodEntry['mood'])}
                className={`
                  flex flex-col items-center justify-center p-6 
                  bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl 
                  border-2 ${m.borderColor}
                  transition-all duration-300 
                  transform hover:scale-105 active:scale-95 
                  ${m.bgHover}
                  group
                  shadow-sm dark:shadow-none
                `}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${m.iconColor}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={() => router.push('/chat')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
          >
            <span>ข้ามขั้นตอนนี้</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MoodPage() {
  return (
    <ProtectedRoute allowedUserTypes={['student']}>
      <MoodSelector />
    </ProtectedRoute>
  );
}
