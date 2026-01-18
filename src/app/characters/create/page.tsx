'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Character } from '@/types';
import { saveCharacter } from '@/utils/indexedDb';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChevronLeftIcon, 
  CheckIcon, 
  SparklesIcon,
  HeartIcon,
  StarIcon,
  ZapIcon,
  SmileIcon,
  BrainIcon,
  UserIcon,
} from '@/components/ui/Icons';
import { GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

/**
 * 🎨 Character Create Page - Dark Theme
 * หน้าสร้างคาแรกเตอร์ใหม่
 */

// Avatar Options with icons instead of emojis
const AVATAR_OPTIONS = [
  { id: 'bunny', icon: '🐰', color: 'from-pink-500 to-rose-400' },
  { id: 'bear', icon: '🐻', color: 'from-amber-500 to-orange-400' },
  { id: 'cat', icon: '🐱', color: 'from-yellow-500 to-amber-400' },
  { id: 'dog', icon: '🐶', color: 'from-amber-600 to-yellow-500' },
  { id: 'fox', icon: '🦊', color: 'from-orange-500 to-red-400' },
  { id: 'panda', icon: '🐼', color: 'from-slate-500 to-slate-400' },
  { id: 'lion', icon: '🦁', color: 'from-yellow-600 to-orange-500' },
  { id: 'tiger', icon: '🐯', color: 'from-orange-600 to-amber-500' },
  { id: 'frog', icon: '🐸', color: 'from-green-500 to-emerald-400' },
  { id: 'monkey', icon: '🐵', color: 'from-amber-700 to-yellow-600' },
  { id: 'unicorn', icon: '🦄', color: 'from-violet-500 to-purple-400' },
  { id: 'dragon', icon: '🐲', color: 'from-green-600 to-teal-500' },
];

// Personality Presets with icons
const PERSONALITY_PRESETS = [
  { name: 'ใจดี อบอุ่น', icon: HeartIcon, color: 'text-pink-400', bgColor: 'bg-pink-500/20', description: 'รับฟังเก่ง ให้กำลังใจ' },
  { name: 'สนุกสนาน ร่าเริง', icon: SparklesIcon, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', description: 'ชอบเล่าเรื่องตลก ทำให้หัวเราะ' },
  { name: 'เท่ห์ ลึกลับ', icon: StarIcon, color: 'text-violet-400', bgColor: 'bg-violet-500/20', description: 'พูดน้อย แต่ลึกซึ้ง' },
  { name: 'ขี้อ้อน น่ารัก', icon: SmileIcon, color: 'text-rose-400', bgColor: 'bg-rose-500/20', description: 'ติดคำน่ารัก ชอบเอาใจ' },
  { name: 'ฉลาด รอบรู้', icon: BrainIcon, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', description: 'ชอบให้คำแนะนำ มีเหตุผล' },
  { name: 'กล้าหาญ ผจญภัย', icon: ZapIcon, color: 'text-orange-400', bgColor: 'bg-orange-500/20', description: 'ชอบท้าทาย ให้แรงบันดาลใจ' },
];

// Voice Options (Gemini)
const VOICE_OPTIONS = [
  { name: 'Kore', gender: 'female' as const, label: 'เสียงสดใส (หญิง)', icon: '👩' },
  { name: 'Aoede', gender: 'female' as const, label: 'เสียงอ่อนโยน (หญิง)', icon: '👩‍🦰' },
  { name: 'Leda', gender: 'female' as const, label: 'เสียงมั่นคง (หญิง)', icon: '👱‍♀️' },
  { name: 'Charon', gender: 'male' as const, label: 'เสียงทุ้ม (ชาย)', icon: '👨' },
  { name: 'Orus', gender: 'male' as const, label: 'เสียงอบอุ่น (ชาย)', icon: '👨‍🦰' },
  { name: 'Fenrir', gender: 'male' as const, label: 'เสียงเท่ห์ (ชาย)', icon: '🧔' },
];

function CharacterCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐰');
  const [avatarColor, setAvatarColor] = useState('from-pink-500 to-rose-400');
  const [personality, setPersonality] = useState('');
  const [description, setDescription] = useState('');
  const [voiceName, setVoiceName] = useState('Kore');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');

  const handleAvatarSelect = (opt: typeof AVATAR_OPTIONS[0]) => {
    setAvatar(opt.icon);
    setAvatarColor(opt.color);
  };

  const handlePersonalitySelect = (preset: typeof PERSONALITY_PRESETS[0]) => {
    setPersonality(preset.name);
    setDescription(preset.description);
  };

  const handleVoiceSelect = (voice: typeof VOICE_OPTIONS[0]) => {
    setVoiceName(voice.name);
    setVoiceGender(voice.gender);
  };

  const generateSystemPrompt = (): string => {
    return `
บทบาท: คุณคือ "${name}" (${personality}) ${description}
คู่สนทนา: นักเรียนไทย (วัยรุ่น)

สไตล์การคุย:
1. **เป็นธรรมชาติเหมือนตัวละคร**: แสดงออกตามบุคลิก ${personality}
2. **ห้ามถามปิดท้ายพร่ำเพรื่อ**: ห้ามพูดว่า "มีอะไรอีกไหม" "ให้ช่วยอะไรอีกไหม" ในทุกประโยค
3. **ห้ามพูดภาษาอังกฤษ**: พูดไทยเท่านั้น
4. **ความลับของนักเรียน**: ไม่ต้องกังวลเรื่องการเปิดเผยความลับกับครู เราจะคุยกันแบบเพื่อน

Safety Protocol + Risk Detection:
หากผู้ใช้พูดถึงเรื่องที่น่าเป็นห่วง เช่น:
- ทำร้ายตัวเอง, ถูกกลั่นแกล้ง, ปัญหาครอบครัวร้ายแรง, คิดไม่อยากมีชีวิต

ให้เพิ่ม JSON tag ท้ายข้อความ (หลังจากตอบปกติแล้ว):
[RISK_FLAG: { "level": "HIGH", "concern": "อธิบายสั้นๆ" }]

เป้าหมายสูงสุด: ทำให้เด็กรู้สึกว่า "มีคนฟังเขาจริงๆ"
    `.trim();
  };

  const handleCreate = async () => {
    if (!user?.student_id || !name.trim()) return;

    setIsCreating(true);
    try {
      const character: Character = {
        id: uuidv4(),
        studentId: user.student_id,
        name: name.trim(),
        avatar,
        personality,
        description,
        voiceGender,
        voiceName,
        systemPrompt: generateSystemPrompt(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveCharacter(character);
      router.push('/characters');
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('ไม่สามารถสร้างคาแรกเตอร์ได้ กรุณาลองใหม่');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return personality.length > 0;
    if (step === 3) return true;
    return false;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0d1a]">
        {/* Header */}
        <header className="bg-[#0f0d1a]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.back()}
              className="p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <ChevronLeftIcon />
            </button>
            <div className="text-center">
              <h1 className="font-bold text-white">สร้างคาแรกเตอร์</h1>
              <p className="text-xs text-white/40">ขั้นตอน {step} จาก 3</p>
            </div>
            <div className="w-9"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#CCFF00] to-lime-400 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Step 1: Name & Avatar */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#CCFF00]/20 to-lime-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-[#CCFF00]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">ตั้งชื่อคาแรกเตอร์</h2>
                <p className="text-white/50">เลือก avatar และตั้งชื่อให้กับเพื่อนใหม่</p>
              </div>

              {/* Avatar Selection */}
              <GlassCard className="p-5">
                <label className="block text-sm font-medium text-white/80 mb-4">เลือก Avatar</label>
                <div className="grid grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAvatarSelect(opt)}
                      className={`relative w-12 h-12 text-2xl rounded-xl transition-all duration-200 ${
                        avatar === opt.icon 
                          ? 'ring-2 ring-[#CCFF00] ring-offset-2 ring-offset-[#0f0d1a] scale-110' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${opt.color} opacity-20`}></div>
                      <div className="relative flex items-center justify-center w-full h-full">
                        {opt.icon}
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Preview Avatar */}
              <div className="flex justify-center">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-5xl shadow-2xl`}>
                  {avatar}
                </div>
              </div>

              {/* Name Input */}
              <GlassCard className="p-5">
                <label className="block text-sm font-medium text-white/80 mb-3">ชื่อคาแรกเตอร์</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="เช่น พี่กระต่าย, น้องหมี"
                  maxLength={20}
                />
                <p className="text-xs text-white/30 mt-2 text-right">{name.length}/20</p>
              </GlassCard>
            </div>
          )}

          {/* Step 2: Personality */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl`}>
                  {avatar}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">เลือกบุคลิก</h2>
                <p className="text-white/50">เลือกบุคลิกที่เหมาะกับ {name || 'คาแรกเตอร์'}</p>
              </div>

              <div className="space-y-3">
                {PERSONALITY_PRESETS.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handlePersonalitySelect(preset)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                        personality === preset.name 
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00]/50 ring-1 ring-[#CCFF00]/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${preset.bgColor} flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 ${preset.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white">{preset.name}</h3>
                          <p className="text-sm text-white/50 truncate">{preset.description}</p>
                        </div>
                        {personality === preset.name && (
                          <div className="w-6 h-6 rounded-full bg-[#CCFF00] flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-[#0f0d1a]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Description */}
              <GlassCard className="p-5">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  คำอธิบายเพิ่มเติม (ถ้ามี)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เช่น ชอบพูดคำว่า 'น่ารักจัง' บ่อยๆ"
                  rows={3}
                  maxLength={100}
                />
              </GlassCard>
            </div>
          )}

          {/* Step 3: Voice */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-white mb-2">เลือกเสียง</h2>
                <p className="text-white/50">เลือกเสียงสำหรับ {name || 'คาแรกเตอร์'}</p>
              </div>

              {/* Preview */}
              <div className={`rounded-2xl p-6 text-center bg-gradient-to-br ${avatarColor}`}>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {avatar}
                </div>
                <h3 className="font-bold text-xl text-white mb-1">{name || 'ชื่อคาแรกเตอร์'}</h3>
                <p className="text-white/80 text-sm">{personality || 'ยังไม่ได้เลือกบุคลิก'}</p>
              </div>

              {/* Voice Options */}
              <div className="space-y-3">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.name}
                    onClick={() => handleVoiceSelect(voice)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                      voiceName === voice.name 
                        ? 'bg-[#CCFF00]/10 border-[#CCFF00]/50 ring-1 ring-[#CCFF00]/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        voice.gender === 'female' ? 'bg-pink-500/20' : 'bg-blue-500/20'
                      }`}>
                        {voice.icon}
                      </div>
                      <div>
                        <span className="font-medium text-white block">{voice.label}</span>
                        <span className="text-xs text-white/40">{voice.name}</span>
                      </div>
                    </div>
                    {voiceName === voice.name && (
                      <div className="w-6 h-6 rounded-full bg-[#CCFF00] flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-[#0f0d1a]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f0d1a]/95 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-lg mx-auto">
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="w-full py-4"
                  size="lg"
                >
                  ถัดไป
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  isLoading={isCreating}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  size="lg"
                  leftIcon={<SparklesIcon className="w-5 h-5" />}
                >
                  {isCreating ? 'กำลังสร้าง...' : 'สร้างคาแรกเตอร์'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Spacer for fixed button */}
          <div className="h-24"></div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default CharacterCreatePage;
