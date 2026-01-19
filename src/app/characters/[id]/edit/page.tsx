'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchCharacter, updateCharacter } from '@/services/characterService';
import { Character } from '@/types';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, Textarea, Avatar } from '@/components/ui';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Star, Smile, Zap, User, Music, Check, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Avatar Options
const AVATAR_OPTIONS = [
  { id: 'bunny', icon: '🐰', color: 'bg-pink-100 dark:bg-pink-900/30 text-2xl' },
  { id: 'bear', icon: '🐻', color: 'bg-amber-100 dark:bg-amber-900/30 text-2xl' },
  { id: 'cat', icon: '🐱', color: 'bg-orange-100 dark:bg-orange-900/30 text-2xl' },
  { id: 'dog', icon: '🐶', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-2xl' },
  { id: 'fox', icon: '🦊', color: 'bg-red-100 dark:bg-red-900/30 text-2xl' },
  { id: 'panda', icon: '🐼', color: 'bg-slate-100 dark:bg-slate-800 text-2xl' },
  { id: 'lion', icon: '🦁', color: 'bg-yellow-200 dark:bg-yellow-800/30 text-2xl' },
  { id: 'dragon', icon: '🐲', color: 'bg-green-100 dark:bg-green-900/30 text-2xl' },
  { id: 'unicorn', icon: '🦄', color: 'bg-purple-100 dark:bg-purple-900/30 text-2xl' },
  { id: 'robot', icon: '🤖', color: 'bg-blue-100 dark:bg-blue-900/30 text-2xl' },
  { id: 'alien', icon: '👽', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-2xl' },
  { id: 'ghost', icon: '👻', color: 'bg-gray-100 dark:bg-gray-900/30 text-2xl' },
];

const PRESETS = [
    { 
        id: 'friendly',
        label: 'ใจดี อบอุ่น', 
        desc: 'เพื่อนที่พร้อมรับฟังและให้กำลังใจเสมอ', 
        icon: Heart, 
        color: 'text-pink-500', 
        prompt: 'You are a warm, kind, and supportive friend. You listen actively and offer gentle encouragement.',
        voice: 'Aoede',
        gender: 'female' as const
    },
    { 
        id: 'funny',
        label: 'สนุกสนาน', 
        desc: 'เพื่อนสายฮาที่จะทำให้คุณยิ้มได้', 
        icon: Smile, 
        color: 'text-yellow-500', 
        prompt: 'You are a funny, energetic, and cheerful friend. You love to tell jokes and keep the mood light.',
        voice: 'Puck',
        gender: 'male' as const
    },
    { 
        id: 'cool',
        label: 'เท่ห์ ลึกลับ', 
        desc: 'เพื่อนที่พูดน้อยแต่เข้าใจคุณดีที่สุด', 
        icon: Star, 
        color: 'text-purple-500', 
        prompt: 'You are a cool, mysterious, and calm friend. Your advice is profound and insightful.',
        voice: 'Charon',
        gender: 'male' as const
    },
    {
        id: 'energetic',
        label: 'กระตือรือล้น',
        desc: 'เพื่อนที่พาคุณไปสู่เป้าหมายใหม่ๆ',
        icon: Zap,
        color: 'text-orange-500',
        prompt: 'You are an energetic and motivating friend. You encourage the user to achieve their goals.',
        voice: 'Fenrir',
        gender: 'male' as const
    }
];

export default function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const characterId = resolvedParams.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  
  // Form Data
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [description, setDescription] = useState('');

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return;
      
      try {
        const char = await fetchCharacter(characterId);
        if (!char) {
          router.push('/');
          return;
        }
        
        setCharacter(char);
        setName(char.name);
        setDescription(char.description || '');
        
        // Find matching avatar
        const matchedAvatar = AVATAR_OPTIONS.find(a => a.icon === char.avatar);
        if (matchedAvatar) setSelectedAvatar(matchedAvatar);
        
        // Find matching preset by personality label
        const matchedPreset = PRESETS.find(p => p.label === char.personality);
        if (matchedPreset) setSelectedPreset(matchedPreset);
        
      } catch (error) {
        console.error('Failed to load character:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCharacter();
  }, [characterId, router]);

  const handleSave = async () => {
    if (!name.trim() || !character) return;
    
    setIsSaving(true);
    try {
      const updates = {
        name: name,
        avatar: selectedAvatar.icon,
        personality: selectedPreset.label,
        description: description || selectedPreset.desc,
        voiceGender: selectedPreset.gender,
        voiceName: selectedPreset.voice,
        systemPrompt: selectedPreset.prompt
      };

      const result = await updateCharacter(character.id, updates);
      if (result) {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['student']}>
        <AppLayout>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!character) return null;

  return (
    <ProtectedRoute allowedUserTypes={['student']}>
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8 flex justify-center">
         <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 rounded-full h-10 w-10 p-0">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">แก้ไขตัวละคร</h1>
                    <p className="text-muted-foreground text-sm">{character.name}</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 md:p-8 space-y-8">
                    {/* Avatar Selection */}
                    <div className="text-center space-y-4">
                        <div className="inline-block relative">
                            <div className={cn("w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-xl transition-colors", selectedAvatar.color)}>
                                {selectedAvatar.icon}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-md overflow-hidden">
                                <Image 
                                    src="/images/brand/koojai-logo.png" 
                                    alt="KooJai Logo" 
                                    width={20} 
                                    height={20}
                                    className="w-5 h-5 object-contain"
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold">เลือกหน้าตา</h2>
                    </div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {AVATAR_OPTIONS.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={cn(
                                    "aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all",
                                    "hover:scale-105 hover:shadow-md",
                                    selectedAvatar.id === avatar.id 
                                        ? "ring-2 ring-primary ring-offset-2 bg-secondary" 
                                        : "bg-secondary/40 hover:bg-secondary"
                                )}
                            >
                                {avatar.icon}
                            </button>
                        ))}
                    </div>

                    {/* Name Input */}
                    <div className="pt-4 space-y-4">
                        <Input
                            label="ชื่อตัวละคร"
                            placeholder="เช่น พี่กระต่าย, น้องหมี"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            leftIcon={<User className="w-5 h-5" />}
                            className="text-lg"
                        />
                    </div>

                    {/* Personality Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">บุคลิกภาพ</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {PRESETS.map((preset) => {
                                const Icon = preset.icon;
                                const isSelected = selectedPreset.id === preset.id;
                                return (
                                    <div 
                                        key={preset.id}
                                        onClick={() => setSelectedPreset(preset)}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                            isSelected 
                                                ? "border-primary bg-primary/5 shadow-md" 
                                                : "border-border bg-card hover:bg-secondary/50 hover:border-primary/30"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSelected ? "bg-primary text-white" : `bg-secondary ${preset.color}`)}>
                                            <Icon className={cn("w-5 h-5", isSelected && "text-white")} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-foreground">{preset.label}</h4>
                                            <p className="text-xs text-muted-foreground">{preset.desc}</p>
                                        </div>
                                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <Textarea
                            label="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                            placeholder="เขียนเพิ่มเติมเกี่ยวกับเพื่อนคนนี้..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Voice Info */}
                    <div className="bg-secondary/30 p-4 rounded-2xl flex items-center gap-3">
                        <Music className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">เสียงพูด: {selectedPreset.voice}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => router.back()} className="flex-1">ยกเลิก</Button>
                        <Button variant="primary" onClick={handleSave} isLoading={isSaving} disabled={!name.trim()} className="flex-1">
                            <Save className="w-5 h-5 mr-2" />
                            บันทึก
                        </Button>
                    </div>
                </Card>
            </motion.div>
         </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
