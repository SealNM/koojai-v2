'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Character } from '@/types';
import { getCharacters } from '@/utils/indexedDb';
import { AppLayout } from '@/components/layout';
import { Button, Card, GlassCard, Badge } from '@/components/ui';
import { 
  ChatIcon, 
  MicIcon, 
  PlusIcon, 
  SparklesIcon,
  KooJaiIcon,
  ChevronRightIcon,
  UsersIcon,
} from '@/components/ui/Icons';

/**
 * 🎨 Home Page - Modern Dark Theme
 * ดีไซน์แบบ BeeBot/TalkMosaic
 */

// KooJai Hero Card Component
function KooJaiHeroCard({ onVoiceChat, onTextChat }: { onVoiceChat: () => void; onTextChat: () => void }) {
  return (
    <GlassCard gradient className="relative">
      {/* Floating Sparkle Effects */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-white/50 dark:bg-white/50 rounded-full animate-pulse delay-300" />
      
      <div className="flex items-start gap-5 mb-6">
        <div className="w-16 h-16 bg-white/30 dark:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
          <KooJaiIcon className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">KooJai</h2>
            <Badge variant="primary" size="sm">AI</Badge>
          </div>
          <p className="text-blue-100 dark:text-blue-200 text-sm">เพื่อนคู่ใจ พร้อมรับฟังทุกเรื่อง</p>
        </div>
      </div>
      
      <p className="text-white/90 dark:text-white/80 mb-8 leading-relaxed">
        สวัสดีจ้ะ! วันนี้มีเรื่องอะไรอยากเล่าให้ฟังไหม? เราพร้อมรับฟังทุกเรื่องเสมอ ไม่ว่าจะสุขหรือทุกข์ เราอยู่ตรงนี้เพื่อเธอนะ ✨
      </p>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onTextChat}
          leftIcon={<ChatIcon className="w-5 h-5" />}
          className="flex-1 !border-white/20 !text-white hover:!bg-white/10"
        >
          พิมพ์คุย
        </Button>
        <Button
          variant="primary"
          onClick={onVoiceChat}
          leftIcon={<MicIcon className="w-5 h-5" />}
          className="flex-1"
        >
          พูดคุย
        </Button>
      </div>
    </GlassCard>
  );
}

// Character Card Component
function CharacterCardItem({ character, onClick }: { character: Character; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 hover:bg-gray-200 dark:hover:bg-slate-800/70 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/20 group-hover:scale-105 transition-transform">
          {character.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
            {character.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{character.personality}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700/50 flex items-center justify-center text-gray-400 dark:text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all">
          <ChatIcon className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

// Create Character Card Component
function CreateCharacterCardItem({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-50 dark:bg-slate-800/30 border-2 border-dashed border-gray-300 dark:border-slate-700/50 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-600/10 transition-all duration-300 group min-h-[88px] flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all">
          <PlusIcon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">
          สร้างเพื่อนใหม่
        </span>
      </div>
    </button>
  );
}

// Tip Card Component
function TipCard() {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">เคล็ดลับวันนี้</h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
            การได้ระบายความรู้สึกออกมา คือก้าวแรกของการฮีลใจนะ วันนี้ถ้าเหนื่อย ลองมาคุยกับเราได้เลย
          </p>
        </div>
      </div>
    </Card>
  );
}

function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingChars, setIsLoadingChars] = useState(true);

  // Redirect if not authenticated or is teacher
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.user_type === 'teacher') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      if (user?.student_id) {
        try {
          const chars = await getCharacters(user.student_id);
          setCharacters(chars);
        } catch (error) {
          console.error('Failed to load characters:', error);
        } finally {
          setIsLoadingChars(false);
        }
      }
    };

    if (isAuthenticated && user?.student_id) {
      loadCharacters();
    }
  }, [user, isAuthenticated]);

  // Show loading while checking auth
  if (isLoading || !isAuthenticated || user?.user_type === 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              สวัสดี, {user?.nickname || user?.first_name || 'เพื่อน'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-lg">
              เลือกเพื่อนคุยที่ถูกใจ แล้วเริ่มบทสนทนาได้เลย
            </p>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: KooJai Hero + Tips */}
            <div className="lg:col-span-5 space-y-6">
              <KooJaiHeroCard 
                onVoiceChat={() => router.push('/chat')} 
                onTextChat={() => router.push('/chat?mode=text')}
              />
              
              <div className="hidden lg:block">
                <TipCard />
              </div>
            </div>

            {/* Right Column: Characters */}
            <div className="lg:col-span-7">
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/15 dark:bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">คาแรกเตอร์ของฉัน</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-500">สร้างและพูดคุยกับเพื่อน AI</p>
                    </div>
                  </div>
                  {characters.length > 0 && (
                    <Badge variant="info">{characters.length} เพื่อน</Badge>
                  )}
                </div>

                {isLoadingChars ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-slate-800/50 rounded-2xl skeleton"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {characters.map((char) => (
                      <CharacterCardItem
                        key={char.id}
                        character={char}
                        onClick={() => router.push(`/characters/${char.id}/chat`)}
                      />
                    ))}
                    
                    <CreateCharacterCardItem onClick={() => router.push('/characters/create')} />
                  </div>
                )}

                {characters.length > 0 && (
                  <button 
                    onClick={() => router.push('/characters')}
                    className="w-full mt-6 py-3 text-center text-sm text-gray-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <span>ดูทั้งหมด</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </Card>

              {/* Mobile Tip */}
              <div className="lg:hidden mt-6">
                <TipCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default HomePage;
