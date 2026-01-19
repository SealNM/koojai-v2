'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Character } from '@/types';
import { fetchCharacters } from '@/services/characterService';
import { AppLayout } from '@/components/layout';
import { Button, Card, Badge, Avatar } from '@/components/ui';
import { Plus, MessageCircle, Sparkles, User, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCharacters();
        setCharacters(data);
      } catch (error) {
        console.error("Failed to load characters", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ProtectedRoute allowedUserTypes={['student']}>
    <AppLayout>
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-8">
        {/* Full width container to avoid empty left gap on large screens */}
        <div className="w-full space-y-8 pb-10">
            {/* Header */}
            <motion.div  
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                   <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 font-kanit">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        สวัสดี, {user?.nickname || user?.first_name || 'เพื่อน'}!
                    </span> 
                    👋
                   </h1>
                   <p className="text-muted-foreground text-lg font-kanit">
                    วันนี้อยากคุยกับใครดี?
                   </p>
                </div>
                <Button onClick={() => router.push('/characters/create')} leftIcon={<Plus className="w-5 h-5"/>} className="shadow-lg shadow-primary/20 font-kanit">
                    สร้างเพื่อนใหม่
                </Button>
            </motion.div>

            {/* Grid */}
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
            >
                {/* KooJai Special Card - Takes full width on mobile, half on desktop, large on large */}
                <motion.div variants={item} className="md:col-span-2 lg:col-span-8">
                    <Card variant="gradient" className="h-full p-8 relative overflow-hidden group border border-primary/10">
                         {/* Decor */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors duration-500" />
                         
                         <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center h-full">
                            <div className="w-24 h-24 bg-background/40 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                                <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-foreground font-kanit">KooJai (คู่ใจ)</h2>
                                    <Badge variant="primary" className="text-xs">Official AI</Badge>
                                </div>
                                <p className="text-foreground/80 leading-relaxed text-lg font-kanit">
                                    เพื่อนคู่ใจที่พร้อมรับฟังทุกเรื่องของคุณ ไม่ว่าจะสุขหรือทุกข์ เราอยู่ตรงนี้เสมอ
                                </p>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Button 
                                        variant="primary" 
                                        onClick={() => router.push('/characters/koojai/chat')} 
                                        leftIcon={<MessageCircle className="w-5 h-5"/>}
                                        className="font-kanit"
                                    >
                                        คุยเลย
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => router.push('/characters/koojai/chat?mode=voice')} 
                                        leftIcon={<Mic className="w-5 h-5"/>}
                                        className="font-kanit"
                                    >
                                        คุยเสียง
                                    </Button>
                                </div>
                            </div>
                         </div>
                    </Card>
                </motion.div>

                {/* Create New - Visible as a card too for visibility */}
                <motion.div variants={item} className="md:col-span-1 lg:col-span-4 lg:row-span-2">
                   {/* We could put something else here, or just let characters flow. 
                       Let's put the first user character here if exists, else "Create New" big card.
                   */}
                   {characters.length === 0 ? (
                        <button 
                            onClick={() => router.push('/characters/create')}
                            className="w-full h-full min-h-[200px] rounded-3xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-4 group text-muted-foreground hover:text-primary bg-card/50"
                        >
                            <div className="w-20 h-20 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors shadow-sm">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="font-medium text-lg font-kanit">สร้างตัวละครแรกของคุณ</span>
                        </button>
                   ) : (
                        <Card className="h-full flex flex-col items-center justify-center p-8 bg-secondary/20 border-dashed border-2 border-border hover:border-primary/50 cursor-pointer group transition-colors" onClick={() => router.push('/characters/create')}>
                            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-primary" />
                            </div>
                             <h3 className="font-bold text-lg text-foreground font-kanit">สร้างเพื่อนใหม่</h3>
                        </Card>
                   )}
                </motion.div>

                {/* Character List */}
                {characters.map((char) => (
                    <motion.div key={char.id} variants={item} className="md:col-span-1 lg:col-span-4">
                        <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer group bg-card hover:-translate-y-1 duration-300" onClick={() => router.push(`/characters/${char.id}/chat`)}>
                            <div className="p-6 flex-1 flex flex-col items-center text-center gap-4">
                                <div className="relative">
                                    <Avatar name={char.name} src={char.avatar} size="2xl" className="shadow-lg ring-4 ring-secondary group-hover:ring-primary/20 transition-all" />
                                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-card" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1 font-kanit">{char.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{char.description || 'ไม่มีคำอธิบาย'}</p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-border bg-secondary/30 flex justify-between items-center">
                                <Badge variant="default" className="text-xs">AI Friend</Badge>
                                <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 -mr-2">
                                    ทักทาย
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
