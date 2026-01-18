'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Character } from '@/types';
import { getCharacters } from '@/utils/indexedDb';
import { AppLayout } from '@/components/layout';
import { Button, Card, GlassCard, Badge } from '@/components/ui';
import { 
  PlusIcon, 
  ChatIcon, 
  MicIcon, 
  KooJaiIcon,
  UsersIcon,
} from '@/components/ui/Icons';

/**
 * 🎭 Characters List Page - Modern Dark Theme
 * ดีไซน์แบบ BeeBot/TalkMosaic
 */

// Character Card Component
function CharacterCardItem({ character, onTextChat }: { character: Character; onTextChat: () => void }) {
  return (
    <Card variant="default" padding="md" className="hover:border-blue-500/50 transition-all group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-2xl flex items-center justify-center text-3xl border border-blue-500/20 group-hover:scale-105 transition-transform">
          {character.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">{character.name}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{character.personality}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">{character.description}</p>
      
      <Button
        variant="secondary"
        onClick={onTextChat}
        leftIcon={<ChatIcon className="w-5 h-5" />}
        className="w-full"
      >
        พิมพ์คุย
      </Button>
    </Card>
  );
}

// Default KooJai Card (รองรับทั้ง Voice และ Text Mode)
function KooJaiCardItem({ onVoiceChat, onTextChat }: { onVoiceChat: () => void; onTextChat: () => void }) {
  return (
    <GlassCard gradient className="relative">
      {/* Floating Sparkle Effects */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
      <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-300" />
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 border border-white/10">
          <KooJaiIcon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">KooJai (คู่ใจ)</h3>
            <Badge variant="primary" size="sm">AI</Badge>
          </div>
          <p className="text-sm text-blue-100 dark:text-blue-200">เพื่อนพี่กระต่ายที่อบอุ่น</p>
        </div>
      </div>
      
      <p className="text-sm text-white/90 dark:text-white/80 mb-4">
        พูดคุยกับ KooJai ได้ทั้งพิมพ์และพูด เราพร้อมรับฟังทุกเรื่องของเธอ
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

function CharactersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      // Wait for auth to complete
      if (authLoading) return;
      
      if (user?.student_id) {
        try {
          console.log('Loading characters for student:', user.student_id);
          const chars = await getCharacters(user.student_id);
          console.log('Loaded characters:', chars);
          setCharacters(chars);
        } catch (error) {
          console.error('Failed to load characters:', error);
        }
      }
      setIsLoading(false);
    };

    loadCharacters();
  }, [user, authLoading]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="min-h-screen p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/15 dark:bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">คาแรกเตอร์</h1>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">เลือกเพื่อน AI ที่ต้องการคุยด้วย</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push('/characters/create')}
                leftIcon={<PlusIcon className="w-5 h-5" />}
              >
                <span className="hidden sm:inline">สร้างใหม่</span>
              </Button>
            </div>

            {/* KooJai Card (Default - ทั้ง Voice และ Text Mode) */}
            <div className="mb-8">
              <KooJaiCardItem 
                onVoiceChat={() => router.push('/chat')} 
                onTextChat={() => router.push('/chat?mode=text')}
              />
            </div>

            {/* Divider */}
            {characters.length > 0 && (
              <div className="flex items-center gap-4 py-4 mb-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                <span className="text-xs text-gray-500 dark:text-slate-500 font-medium uppercase tracking-wider">คาแรกเตอร์ของฉัน</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
              </div>
            )}

            {/* Characters List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <CharacterCardItem
                    key={char.id}
                    character={char}
                    onTextChat={() => router.push(`/characters/${char.id}/chat`)}
                  />
                ))}
              </div>
            ) : (
              <Card variant="default" padding="lg" className="text-center">
                <div className="py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                    <UsersIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">ยังไม่มีคาแรกเตอร์</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">สร้างคาแรกเตอร์ใหม่เพื่อเริ่มคุยแบบพิมพ์</p>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/characters/create')}
                    leftIcon={<PlusIcon className="w-5 h-5" />}
                  >
                    สร้างคาแรกเตอร์
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default CharactersPage;
