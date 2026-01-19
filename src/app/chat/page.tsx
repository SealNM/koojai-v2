'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { 
  MessageCircle, 
  Calendar, 
  ChevronRight, 
  Search,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Chat, Character } from '@/types';
import { getChatsByStudent } from '@/utils/indexedDb';
import { fetchCharacter } from '@/services/characterService';

// 🐰 Default KooJai Character (Frontend Constant)
const KOOJAI_CHARACTER_ID = 'koojai-default';
const KOOJAI_CHARACTER: Character = {
  id: KOOJAI_CHARACTER_ID,
  studentId: 'system',
  name: 'KooJai (คู่ใจ)',
  avatar: '🐰',
  personality: 'Friend',
  description: 'Your AI Companion',
  voiceGender: 'female',
  voiceName: 'Kore',
  systemPrompt: '',
  createdAt: 0,
  updatedAt: 0,
};

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return date.toLocaleDateString('th-TH', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }
}

export default function ChatHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [charMap, setCharMap] = useState<Record<string, Character>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load Chats
  useEffect(() => {
    async function loadData() {
      if (!user?.student_id) return;
      
      try {
        const chatList = await getChatsByStudent(user.student_id);
        setChats(chatList);

        // Identify unique characters to fetch
        const uniqueCharIds = Array.from(new Set(chatList.map(c => c.characterId)));
        
        const newCharMap: Record<string, Character> = {};
        
        await Promise.all(uniqueCharIds.map(async (id) => {
          if (id === KOOJAI_CHARACTER_ID) {
            newCharMap[id] = KOOJAI_CHARACTER;
          } else {
            // Fetch from API
            // Note: Since API fetch might fail if offline or deleted, we handle null
            const char = await fetchCharacter(id);
            if (char) {
              newCharMap[id] = char;
            } else {
              // Fallback placeholder
              newCharMap[id] = {
                id,
                name: 'Unknown Character',
                avatar: '❓',
              } as Character;
            }
          }
        }));

        setCharMap(newCharMap);
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.student_id]);

  // Filter chats
  const filteredChats = chats.filter(chat => {
    const char = charMap[chat.characterId];
    const nameData = char?.name || '';
    const titleData = chat.title || '';
    const search = searchTerm.toLowerCase();
    return nameData.toLowerCase().includes(search) || titleData.toLowerCase().includes(search);
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <ProtectedRoute allowedUserTypes={['student']}>
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ประวัติการสนทนา
              </h1>
              <p className="text-muted-foreground">
                ดูประวัติการคุยที่ผ่านมา
              </p>
            </div>
            
            <div className="flex gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="ค้นหาข้อความ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-foreground placeholder:text-slate-500 dark:placeholder:text-slate-500"
                  />
               </div>
            </div>
          </div>

          {/* List */}
          {loading ? (
             <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
             </div>
          ) : filteredChats.length === 0 ? (
             <div className="text-center py-20 opacity-70">
                <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">ไม่พบประวัติการสนทนา</p>
                <p className="text-slate-500 text-sm mb-6">ลองเริ่มคุยกับเพื่อนใหม่สิ!</p>
                <Button 
                    variant="primary" 
                    onClick={() => router.push('/')}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    เริ่มแชทใหม่
                </Button>
             </div>
          ) : (
             <motion.div 
               variants={container}
               initial="hidden"
               animate="show"
               className="grid gap-3"
             >
                {filteredChats.map((chat) => {
                  const char = charMap[chat.characterId] || KOOJAI_CHARACTER;
                  return (
                    <motion.div key={chat.id} variants={item}>
                      <Card 
                        className="group flex items-center p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                        onClick={() => router.push(
                          chat.characterId === KOOJAI_CHARACTER_ID 
                            ? `/characters/koojai/chat` 
                            : `/characters/${chat.characterId}/chat`
                        )}
                      >
                        <Avatar 
                          src={char.avatar} 
                          name={char.name} 
                          className="w-12 h-12 md:w-14 md:h-14 ring-2 ring-white dark:ring-slate-800 shadow-sm mr-4"
                        />
                        
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                                {char.name}
                              </h3>
                              <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                <Calendar className="w-3 h-3" />
                                {formatDate(chat.lastMessageAt)}
                              </span>
                           </div>
                           
                           <p className="text-sm text-muted-foreground truncate">
                             {chat.title || 'Start of conversation...'}
                           </p>
                        </div>

                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                           <ChevronRight className="w-5 h-5 text-indigo-500" />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
             </motion.div>
          )}

        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
