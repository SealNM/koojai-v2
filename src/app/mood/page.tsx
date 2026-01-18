'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { KooJaiIcon } from '@/components/ui/Icons';
import { 
  Smile, 
  Meh, 
  Frown, 
  CloudRain, 
  Zap, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MoodEntry } from '@/types';

/**
 * 🎨 MoodPage - Modern Dark Theme
 * Mood selection screen before starting chat
 */

const moods = [
  { 
    mood: 'happy', 
    icon: Smile, 
    label: 'Happy', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    gradient: 'from-emerald-500/20 to-green-500/5'
  },
  { 
    mood: 'neutral', 
    icon: Meh, 
    label: 'Neutral', 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    border: 'border-blue-500/20 hover:border-blue-500/50',
    gradient: 'from-blue-500/20 to-slate-500/5'
  },
  { 
    mood: 'tired', 
    icon: CloudRain, 
    label: 'Tired', 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10 hover:bg-slate-500/20',
    border: 'border-slate-500/20 hover:border-slate-500/50',
    gradient: 'from-slate-500/20 to-gray-500/5'
  },
  { 
    mood: 'sad', 
    icon: Frown, 
    label: 'Sad', 
    color: 'text-violet-400', 
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
    border: 'border-violet-500/20 hover:border-violet-500/50',
    gradient: 'from-violet-500/20 to-purple-500/5'
  },
  { 
    mood: 'angry', 
    icon: Zap, 
    label: 'Frustrated', 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10 hover:bg-orange-500/20',
    border: 'border-orange-500/20 hover:border-orange-500/50',
    gradient: 'from-orange-500/20 to-red-500/5'
  },
] as const;

function MoodSelector() {
  const router = useRouter();
  const { user } = useAuth();
  
  const handleMoodSelect = async (mood: MoodEntry['mood']) => {
    if (user?.student_id) {
      try {
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
    }
    // Navigate to KooJai chat (default) with mood param
    router.push(`/characters/koojai/chat?mood=${mood}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0f0d1a] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6"
          >
            <KooJaiIcon className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-3">
            Hello, {user?.nickname || user?.first_name || 'Friend'} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            How are you feeling today?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {moods.map((m) => (
            <motion.button
              key={m.mood}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(m.mood as MoodEntry['mood'])}
              className={`
                group relative flex flex-col items-center justify-center p-6 h-40
                rounded-3xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md
                transition-all duration-300 shadow-sm hover:shadow-lg
                ${m.border} ${m.bg}
              `}
            >
              {/* Graduate Accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className={`
                relative z-10 w-16 h-16 rounded-2xl mb-3 flex items-center justify-center
                bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all
              `}>
                <m.icon className={`w-8 h-8 ${m.color}`} />
              </div>
              
              <span className="relative z-10 text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div variants={itemVariants} className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/chat')}
            className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            Skip for now 
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

      </motion.div>
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
