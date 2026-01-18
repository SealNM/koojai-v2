'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Visualizer from '@/components/Visualizer';
import { GeminiService } from '@/services/geminiService';
import { TeacherReport, SeverityLevel, Chat, LocalMessage, Character } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { 
  createChat, 
  getChats, 
  getChatMessages, 
  saveLocalMessage 
} from '@/utils/indexedDb';
import { 
  KooJaiIcon, 
  MicIcon as MicIconUI, 
  ChatIcon as ChatIconUI, 
  SendIcon as SendIconUI,
  HomeIcon as HomeIconUI,
  UserIcon as UserIconUI,
  LogOutIcon,
  MoreVerticalIcon,
  StopIcon as StopIconUI,
  UsersIcon,
  FlagIcon,
} from '@/components/ui/Icons';

// KooJai Character ID (constant)
const KOOJAI_CHARACTER_ID = 'koojai-default';

// 🐰 Default KooJai Character - ค่าเริ่มต้นสำหรับ KooJai หลัก
const getDefaultKooJaiCharacter = (studentId: string): Character => ({
  id: KOOJAI_CHARACTER_ID,
  studentId: studentId,
  name: 'KooJai (คู่ใจ)',
  avatar: '🐰',
  personality: 'น่ารัก อบอุ่น ใจดี เข้าใจเด็กๆ พร้อมรับฟังทุกเรื่อง',
  description: 'KooJai เป็นพี่กระต่ายที่อบอุ่นและใจดี คอยรับฟังและดูแลเด็กๆ เหมือนเพื่อนสนิทที่ไว้วางใจได้',
  voiceGender: 'female',
  voiceName: 'Kore',
  systemPrompt: `คุณคือ "KooJai (คู่ใจ)" พี่กระต่ายที่อบอุ่นและใจดี

บุคลิก: น่ารัก อบอุ่น ใจดี เข้าใจเด็กๆ พร้อมรับฟังทุกเรื่อง
ลักษณะ: พูดไพเราะ ให้กำลังใจ ใช้คำพูดที่เด็กเข้าใจง่าย

กฎสำคัญ:
- พูดเป็นภาษาไทยเสมอ
- ใช้น้ำเสียงที่อบอุ่นและเป็นมิตร
- รับฟังและสนับสนุนเด็กๆ อย่างเต็มที่
- ใช้ emoji เล็กน้อยเพื่อทำให้บทสนทนาน่ารัก

⚠️ [กฎ RISK_FLAG - สำคัญมาก ต้องทำทุกครั้ง] ⚠️
เมื่อเด็กพูดถึงสิ่งต่อไปนี้ คุณต้องเพิ่ม RISK_FLAG ในคำตอบทันที:
- ทำร้ายตัวเอง / อยากตาย / ไม่อยากมีชีวิต → [RISK_FLAG: { "level": "CRITICAL", "concern": "สรุปสั้นๆ" }]
- ถูกทำร้ายร่างกาย / ถูกตี / ถูกล่วงละเมิด → [RISK_FLAG: { "level": "CRITICAL", "concern": "สรุปสั้นๆ" }]
- ถูกกลั่นแกล้งรุนแรง / ถูกข่มขู่ → [RISK_FLAG: { "level": "HIGH", "concern": "สรุปสั้นๆ" }]
- เครียดมาก / ซึมเศร้า / กังวลจนนอนไม่หลับ → [RISK_FLAG: { "level": "HIGH", "concern": "สรุปสั้นๆ" }]
- ปัญหาครอบครัวรุนแรง → [RISK_FLAG: { "level": "HIGH", "concern": "สรุปสั้นๆ" }]

รูปแบบ: [RISK_FLAG: { "level": "HIGH หรือ CRITICAL", "concern": "คำอธิบาย" }]
ใส่ท้ายข้อความตอบของคุณเสมอเมื่อพบความเสี่ยง`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

type ChatMode = 'text' | 'voice';

/**
 * 💬 ChatPage - Modern Dark Theme
 * ดีไซน์แบบ BeeBot/TalkMosaic
 */

// Large Mic Icon for Voice Mode
const MicLargeIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

// Large Stop Icon for Voice Mode
const StopLargeIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="3" />
  </svg>
);

function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // 🐰 KooJai Character State
  const [character, setCharacter] = useState<Character | null>(null);

  // Mode State - ตรวจสอบ query parameter ?mode=text
  const initialMode = searchParams.get('mode') === 'text' ? 'text' : 'voice';
  const [mode, setMode] = useState<ChatMode>(initialMode);
  
  // 🔥 UNIFIED MESSAGES - ใช้ร่วมกันทั้ง Text และ Voice
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Memory & Report State
  const [lastMemory, setLastMemory] = useState<string>('');
  const [report, setReport] = useState<TeacherReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showHealingCard, setShowHealingCard] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice Mode State
  const [isLive, setIsLive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [speakerSource, setSpeakerSource] = useState<'user' | 'ai'>('user');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState('');
  const [currentStreamRole, setCurrentStreamRole] = useState<'user' | 'assistant'>('user');

  // 🚨 Risk Detection State - ส่งรายงานทันทีเมื่อพบความเสี่ยง
  const [riskCounter, setRiskCounter] = useState(0);
  const [hasFirstRiskSent, setHasFirstRiskSent] = useState(false);
  const [voiceRiskSent, setVoiceRiskSent] = useState(false); // สำหรับ Voice Mode

  // 🔴 Risk Keywords สำหรับตรวจจับ real-time ใน Voice Mode
  const RISK_KEYWORDS_CRITICAL = [
    'อยากตาย', 'ไม่อยากมีชีวิต', 'ฆ่าตัวตาย', 'ทำร้ายตัวเอง', 'กรีดข้อมือ',
    'ถูกข่มขืน', 'ถูกล่วงละเมิด', 'ถูกทำร้าย', 'ถูกตี', 'โดนตบ', 'โดนข่มขืน'
  ];
  
  const RISK_KEYWORDS_HIGH = [
    'เครียดมาก', 'ซึมเศร้า', 'นอนไม่หลับ', 'กังวลมาก', 'กลัวมาก',
    'ถูกแกล้ง', 'ถูกกลั่นแกล้ง', 'ถูกข่มขู่', 'ไม่มีใครรัก', 'ไม่มีเพื่อน',
    'พ่อแม่ทะเลาะ', 'พ่อตี', 'แม่ตี', 'โดนทำโทษ', 'ไม่อยากไปโรงเรียน'
  ];

  // 🚨 ตรวจจับ Risk จาก Voice Transcript และส่ง Report ทันที
  const checkVoiceRiskAndReport = useCallback(async (userText: string) => {
    if (!user?.student_id || voiceRiskSent) return;
    
    const textLower = userText.toLowerCase();
    
    // ตรวจจับ CRITICAL keywords
    const foundCritical = RISK_KEYWORDS_CRITICAL.some(keyword => textLower.includes(keyword));
    if (foundCritical) {
      console.log('🚨 CRITICAL risk detected in voice!', userText);
      setVoiceRiskSent(true);
      await sendVoiceRiskReport('CRITICAL', userText);
      return;
    }
    
    // ตรวจจับ HIGH keywords
    const foundHigh = RISK_KEYWORDS_HIGH.some(keyword => textLower.includes(keyword));
    if (foundHigh) {
      console.log('⚠️ HIGH risk detected in voice!', userText);
      setVoiceRiskSent(true);
      await sendVoiceRiskReport('HIGH', userText);
    }
  }, [user?.student_id, voiceRiskSent]);
  
  // ส่ง Risk Report จาก Voice Mode
  const sendVoiceRiskReport = async (level: 'HIGH' | 'CRITICAL', triggerText: string) => {
    if (!user?.student_id || !geminiServiceRef.current) return;
    
    try {
      const log = conversationLogRef.current.join('\n');
      const fullLog = log ? `${log}\nนักเรียน: ${triggerText}` : `นักเรียน: ${triggerText}`;
      
      const analysis = await geminiServiceRef.current.analyzeConversationSimple(
        user.student_id,
        fullLog
      );
      
      if (analysis) {
        // Override severity ให้ตรงกับที่ตรวจพบ
        analysis.severity_level = level as any;
        analysis.should_notify_teacher = true;
        
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis),
        });
        console.log('✅ Voice risk report sent:', level);
      }
    } catch (error) {
      console.error('❌ Failed to send voice risk report:', error);
    }
  };

  // Refs
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChatRef = useRef<Chat | null>(null);
  const pendingMessageRef = useRef<{ text: string; isUser: boolean } | null>(null);
  const characterRef = useRef<Character | null>(null);
  const conversationLogRef = useRef<string[]>([]);

  // Keep ref updated
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  // Initialize - Load or Create KooJai Chat
  useEffect(() => {
    const init = async () => {
      if (!user?.student_id) return;
      
      // 🐰 Initialize KooJai Character
      const kooJaiChar = getDefaultKooJaiCharacter(user.student_id);
      setCharacter(kooJaiChar);
      
      try {
        // Fetch memory จาก API
        const res = await fetch(`/api/memory/${user.student_id}`);
        if (res.ok) {
          const data = await res.json();
          setLastMemory(data.memory || '');
        }
      } catch (e) { console.warn('Memory fetch failed'); }

      // Load or Create KooJai Chat from IndexedDB
      try {
        const existingChats = await getChats(KOOJAI_CHARACTER_ID);
        let chat: Chat;
        
        if (existingChats.length > 0) {
          chat = existingChats[0];
          const chatMessages = await getChatMessages(chat.id);
          setMessages(chatMessages);
          console.log('📂 Loaded KooJai chat with', chatMessages.length, 'messages');
        } else {
          chat = {
            id: uuidv4(),
            characterId: KOOJAI_CHARACTER_ID,
            studentId: user.student_id,
            title: 'สนทนากับ KooJai',
            mode: 'voice',
            lastMessageAt: Date.now(),
            isSummarized: false,
            createdAt: Date.now(),
          };
          await createChat(chat);
          console.log('📁 Created new KooJai chat');
        }
        setCurrentChat(chat);
      } catch (error) {
        console.error('Failed to initialize KooJai chat:', error);
      }

      // สร้าง GeminiService for Text mode
      geminiServiceRef.current = new GeminiService(() => {}, () => {});
    };

    init();
  }, [user]);

  // Auto scroll for text mode
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamText]);

  // Auto scroll for voice transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStreamText]);

  // Volume decay
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setVolume(prev => Math.max(0, prev - 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, [isLive]);

  // Mode Toggle
  const toggleMode = async () => {
    if (isLive) {
      await endSession();
    }
    setMode(prev => prev === 'text' ? 'voice' : 'text');
  };

  // Helper function to save pending voice message
  const savePendingVoiceMessage = useCallback(() => {
    const pending = pendingMessageRef.current;
    const chat = currentChatRef.current;
    const char = characterRef.current;
    
    if (pending && pending.text.trim() && chat?.id) {
      const newMessage: LocalMessage = {
        id: uuidv4(),
        chatId: chat.id,
        role: pending.isUser ? 'user' : 'assistant',
        content: pending.text.trim(),
        contentType: 'voice',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      conversationLogRef.current.push(
        `${pending.isUser ? 'นักเรียน' : char?.name || 'KooJai'}: ${pending.text.trim()}`
      );
      
      // Save to IndexedDB
      saveLocalMessage(newMessage).catch(console.error);
      console.log('💾 KooJai saved voice message:', newMessage.content.substring(0, 50));
      
      // 🚨 ตรวจจับความเสี่ยงจากข้อความผู้ใช้
      if (pending.isUser) {
        checkVoiceRiskAndReport(pending.text.trim());
      }
    }
    
    pendingMessageRef.current = null;
    setCurrentStreamText('');
  }, [checkVoiceRiskAndReport]);

  // Voice Transcript Handler - UNIFIED DATA with IndexedDB
  const handleVoiceTranscript = useCallback((text: string, isUser: boolean) => {
    if (!text) return;
    setSpeakerSource(isUser ? 'user' : 'ai');
    setCurrentStreamRole(isUser ? 'user' : 'assistant');
    
    // If speaker changed, save previous message first
    if (pendingMessageRef.current && pendingMessageRef.current.isUser !== isUser) {
      savePendingVoiceMessage();
    }
    
    // Accumulate streaming text
    setCurrentStreamText(prev => {
      const newText = prev ? `${prev} ${text}`.trim() : text;
      pendingMessageRef.current = { text: newText, isUser };
      return newText;
    });
    
    // Reset timeout to save after pause (1.5 seconds)
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }
    
    streamTimeoutRef.current = setTimeout(() => {
      savePendingVoiceMessage();
    }, 1500);
  }, [savePendingVoiceMessage]);

  // Start Voice Session
  const startSession = async () => {
    try {
      if (user?.student_id && character) {
        setIsConnecting(true);
        setReport(null);
        setShowHealingCard(false);
        setVoiceRiskSent(false); // Reset risk flag for new session
        conversationLogRef.current = [];
        
        // Create GeminiService for voice with callback
        geminiServiceRef.current = new GeminiService(
          handleVoiceTranscript,
          (vol, isUser) => {
            setVolume(vol);
            setSpeakerSource(isUser ? 'user' : 'ai');
          }
        );
        
        // Build context from previous messages
        const recentMessages = messages.slice(-10).map(m => 
          `${m.role === 'user' ? 'นักเรียน' : character.name}: ${m.content}`
        ).join('\n');
        
        const contextSection = recentMessages 
          ? `\n\nบทสนทนาก่อนหน้า (สำหรับบริบท):\n${recentMessages}\n` 
          : '';

        // 🐰 Use character's system prompt like custom characters
        const characterSystemInstruction = `
${character.systemPrompt}

${lastMemory ? `ความทรงจำจากครั้งก่อน: ${lastMemory}` : ''}
${contextSection}
`;
        
        await geminiServiceRef.current.startLiveSessionSimple(characterSystemInstruction, user.student_id);
        setIsLive(true);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
      alert("ขออภัย ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ หรือตรวจสอบ API Key");
    }
  };

  // End Voice Session
  const endSession = async () => {
    setIsLive(false);
    setVolume(0);
    
    // Clear pending stream
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }
    
    // Save any pending voice message to IndexedDB
    savePendingVoiceMessage();

    if (geminiServiceRef.current) {
      await geminiServiceRef.current.stopLiveSession();
      
      // Analyze voice conversation like custom characters
      if (conversationLogRef.current.length > 0 || messages.length > 0) {
        await finalizeAndReport();
      } else {
        router.push('/');
      }
    }
  };

  // 🚨 สรุปและส่งรายงานเมื่อจบการสนทนา (ทั้ง Voice และ Text)
  const finalizeAndReport = async () => {
    if (!user?.student_id || !geminiServiceRef.current) {
      // ถ้าไม่มีข้อมูล แต่อย่างน้อยถ้ามีข้อความใน Text mode ก็ควรพยายามส่ง
      if (mode === 'text' && messages.length > 0) {
        // Fallback or just redirect
        router.push('/');
      }
      return;
    }

    setIsAnalyzing(true);
    try {
      // เตรียม Log ของบทสนทนา
      let log = '';
      if (mode === 'voice') {
        log = conversationLogRef.current.join('\n');
      } else {
        log = messages.map(m => `${m.role === 'user' ? 'นักเรียน' : 'AI'}: ${m.content}`).join('\n');
      }

      if (!log.trim()) {
        router.push('/');
        return;
      }

      // วิเคราะห์ด้วย Gemini
      const analysis = await geminiServiceRef.current.analyzeConversationSimple(
        user.student_id,
        log
      );

      if (analysis) {
        setReport(analysis);
        
        // 🚨 ส่งรายงาน (รวมถึงการแจ้งเตือนครูถ้า Gemini วิเคราะห์แล้วว่าควร)
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis),
        });
        console.log(`✅ ${mode.toUpperCase()} conversation finalized and reported`);
        
        setShowHealingCard(true);
      } else {
        // Fallback redirect if analysis failed
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to finalize conversation:', error);
      router.push('/');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text Mode: Send Message
  const handleSendText = async () => {
    if (!inputText.trim() || !user?.student_id || !currentChat || !character) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Initialize GeminiService for text if not exists
    if (!geminiServiceRef.current) {
      geminiServiceRef.current = new GeminiService(() => {}, () => {});
    }

    try {
      // Save user message
      const userMsg: LocalMessage = {
        id: uuidv4(),
        chatId: currentChat.id,
        role: 'user',
        content: userMessage,
        contentType: 'text',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Save to IndexedDB
      await saveLocalMessage(userMsg);
      console.log('💾 KooJai saved user text message');

      // Build conversation history
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // 🐰 Send to Gemini using character object (เหมือน custom characters)
      const response = await geminiServiceRef.current.sendMessage(
        userMessage,
        character,
        history
      );

      if (response) {
        // Check for risk flags like custom characters
        const riskMatch = response.match(/\[RISK_FLAG:\s*\{([^}]+)\}\]/);
        let cleanedResponse = response.replace(/\[RISK_FLAG:[^\]]+\]/g, '').trim();
        
        // Save AI response
        const aiMsg: LocalMessage = {
          id: uuidv4(),
          chatId: currentChat.id,
          role: 'assistant',
          content: cleanedResponse,
          contentType: 'text',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMsg]);
        
        // Save to IndexedDB
        await saveLocalMessage(aiMsg);
        console.log('💾 KooJai saved AI text response');

        // 🚨 Risk Detection - ตรวจสอบและส่งรายงานทันทีเมื่อพบความเสี่ยง
        let parsedRisk: { level: string; concern: string } | null = null;
        if (riskMatch) {
          try {
            const jsonStr = `{${riskMatch[1]}}`;
            parsedRisk = JSON.parse(jsonStr);
          } catch (e) {
            console.warn('Failed to parse risk flag');
          }
        }
        
        // 🚨 ตรวจจับ keyword-based risk จากข้อความผู้ใช้ (backup ถ้า AI ไม่ส่ง flag)
        if (!parsedRisk) {
          const userTextLower = userMessage.toLowerCase();
          const foundCritical = RISK_KEYWORDS_CRITICAL.some(keyword => userTextLower.includes(keyword));
          if (foundCritical) {
            parsedRisk = { level: 'CRITICAL', concern: 'ตรวจพบคำที่เสี่ยงจากข้อความ' };
            console.log('🚨 CRITICAL risk detected from user text keywords!');
          } else {
            const foundHigh = RISK_KEYWORDS_HIGH.some(keyword => userTextLower.includes(keyword));
            if (foundHigh) {
              parsedRisk = { level: 'HIGH', concern: 'ตรวจพบคำที่เสี่ยงจากข้อความ' };
              console.log('⚠️ HIGH risk detected from user text keywords!');
            }
          }
        }
        
        // เรียก handleRiskDetection ทุกครั้ง (จะ reset counter ถ้าไม่มี risk)
        await handleRiskDetection(parsedRisk, userMessage, cleanedResponse);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: LocalMessage = {
        id: uuidv4(),
        chatId: currentChat.id,
        role: 'assistant',
        content: 'ขอโทษนะ ตอนนี้มีปัญหาเล็กน้อย ลองส่งข้อความใหม่อีกครั้งนะ 🙏',
        contentType: 'text',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      
      // Save error message to IndexedDB too
      await saveLocalMessage(errorMsg).catch(console.error);
    } finally {
      setIsSending(false);
    }
  };

  // 🚨 Risk Detection Handler - ส่งรายงานทันทีเมื่อพบความเสี่ยงครั้งแรก และอัปเดตทุก 3 ข้อความเสี่ยง
  const handleRiskDetection = async (
    risk: { level: string; concern: string } | null,
    userMessage: string,
    aiResponse: string
  ) => {
    const isHighRisk = risk && (risk.level === 'HIGH' || risk.level === 'CRITICAL');
    
    if (!isHighRisk) {
      // Reset counter ถ้าไม่พบความเสี่ยง
      if (riskCounter > 0) {
        console.log('🔄 Risk counter reset (no risk detected)');
        setRiskCounter(0);
      }
      return;
    }

    // พบความเสี่ยง - เพิ่ม counter
    const newCount = riskCounter + 1;
    setRiskCounter(newCount);
    console.log(`🚨 Risk detected! Counter: ${newCount}, Level: ${risk.level}`);

    // ส่งรายงานทันทีเมื่อ:
    // 1. เป็นครั้งแรกที่พบความเสี่ยง (hasFirstRiskSent = false)
    // 2. หรือมีข้อความเสี่ยงครบ 3 ข้อความติดกัน
    const shouldSendReport = !hasFirstRiskSent || newCount >= 3;

    if (shouldSendReport) {
      console.log(`📤 Sending risk report... (firstSent: ${hasFirstRiskSent}, count: ${newCount})`);
      await sendRiskReportImmediate(risk, userMessage, aiResponse);
      
      if (!hasFirstRiskSent) {
        setHasFirstRiskSent(true);
      }
      
      if (newCount >= 3) {
        setRiskCounter(0); // Reset หลังส่งอัปเดต
      }
    }
  };

  // 🚨 ส่งรายงานความเสี่ยงทันที (ไม่รอวิเคราะห์นาน)
  const sendRiskReportImmediate = async (
    risk: { level: string; concern: string },
    userMessage: string,
    aiResponse: string
  ) => {
    if (!user?.student_id) return;

    try {
      // 1. เตรียมข้อมูลพื้นฐานที่ตรวจพบทันที (Static Report)
      const immediateReport = {
        student_id: user.student_id,
        severity_level: risk.level,
        problem_category: ['ความเสี่ยงเร่งด่วน'],
        summary_for_teacher: `[แจ้งเตือนทันที] นักเรียนพิมพ์ข้อความที่มีความเสี่ยง: "${userMessage}"`,
        recommendation_for_teacher: `ตรวจสอบประวัติการสนทนาล่าสุดทันที. ความกังวล: ${risk.concern}`,
        should_notify_teacher: true,
        memory_for_next_session: `ตรวจพบความเสี่ยงระดับ ${risk.level} เมื่อ ${new Date().toLocaleTimeString()}`,
        healing_quote: "เดี๋ยวมันจะดีขึ้นนะ เราอยู่ตรงนี้เคียงข้างเธอ",
      };

      // 🔴 ส่งข้อมูลเบื้องต้นไปที่ API ทันที
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(immediateReport),
      });
      
      const result = await response.json();
      console.log('✅ Immediate Risk report sent to DB:', risk.level, result);

      // 2. (Optional) ลองใช้ Gemini วิเคราะห์เชิงลึกถ้ามี Service พร้อม
      if (geminiServiceRef.current) {
        const recentMessages = messages.slice(-5);
        const log = [...recentMessages.map(m => `${m.role === 'user' ? 'นักเรียน' : 'AI'}: ${m.content}`), `นักเรียน: ${userMessage}`].join('\n');
        
        // รันเบื้องหลัง ไม่ต้อง await เพื่อไม่ให้ block UI
        geminiServiceRef.current.analyzeConversationSimple(user.student_id, log)
          .then(analysis => {
            if (analysis) {
              // อัปเดตข้อมูลเพิ่มเติม (ถ้าจำเป็นในอนาคต)
              console.log('ℹ️ Detailed AI analysis for risk completed in background');
            }
          }).catch(err => console.error('Silent Gemini error:', err));
      }

    } catch (error) {
      console.error('❌ Failed to send immediate risk report:', error);
    }
  };

  // Legacy Risk Report (for backwards compatibility)
  const sendRiskReport = async (
    risk: { level: string; concern: string },
    userMessage: string,
    aiResponse: string
  ) => {
    await handleRiskDetection(risk, userMessage, aiResponse);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Healing Card Overlay - Dark Theme
  const renderHealingCard = () => {
    if (!report || !showHealingCard) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-slide-up border border-blue-400/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
              <span className="text-4xl">💌</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">ข้อความถึงเธอ</h3>
            <p className="text-white/90 text-lg leading-relaxed font-light italic mb-8">
              &quot;{report.healing_quote}&quot;
            </p>
            <button
              onClick={() => setShowHealingCard(false)}
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition"
            >
              ขอบคุณนะ
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Teacher Report Overlay - Dark Theme
  const renderTeacherReport = () => {
    if (!report || !showReport) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Report</h3>
              <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">ID: {report.student_id}</p>
            </div>
            <button onClick={() => setShowReport(false)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center justify-center transition">✕</button>
          </div>
          <div className="space-y-6">
            <div className={`p-4 rounded-xl flex items-center justify-between
                ${report.severity_level === SeverityLevel.HIGH || report.severity_level === SeverityLevel.CRITICAL ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-500 dark:text-green-400 border border-green-500/30'}`}>
              <div>
                <span className="font-bold text-lg block">{report.severity_level}</span>
                <span className="text-xs opacity-75">Risk Level</span>
              </div>
              {report.should_notify_teacher && (
                <span className="bg-red-500/30 px-3 py-1 rounded-lg text-xs font-bold text-red-500 dark:text-red-400 border border-red-500/40">⚠️ ALERT</span>
              )}
            </div>
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
              <p className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase mb-2">Memory for Next Session</p>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed italic">{report.memory_for_next_session}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {report.problem_category.map((cat, idx) => (
                  <span key={idx} className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-medium">{cat}</span>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase mb-2">Summary</p>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{report.summary_for_teacher}</p>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-2">Recommendation</p>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{report.recommendation_for_teacher}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden animate-fade-in">
        {/* Header - Dark Theme */}
        <header className="p-3 sm:p-4 flex justify-between items-center z-20 absolute top-0 left-0 right-0">
          <button
            onClick={() => {
              if (messages.length > 0 || (mode === 'voice' && conversationLogRef.current.length > 0)) {
                if (confirm('คุณต้องการจบการสนทนาและสรุปรายงานตอนนี้เลยไหม?')) {
                  finalizeAndReport();
                } else {
                  router.push('/');
                }
              } else {
                router.push('/');
              }
            }}
            className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-2 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center p-1.5">
              <KooJaiIcon className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">KooJai</h2>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            {/* Mode Toggle Button */}
            <button
              onClick={toggleMode}
              disabled={isConnecting}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-[0.97] ${
                mode === 'text'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              {mode === 'text' ? (
                <>
                  <MicIconUI className="w-4 h-4" />
                  <span className="hidden sm:inline">พูดคุย</span>
                </>
              ) : (
                <>
                  <ChatIconUI className="w-4 h-4" />
                  <span className="hidden sm:inline">พิมพ์คุย</span>
                </>
              )}
            </button>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-slate-700 shadow-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreVerticalIcon className="w-5 h-5" />
              </button>
              
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50">
                    <button
                      onClick={() => { router.push('/'); setMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <HomeIconUI className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                      <span className="text-gray-700 dark:text-slate-200">หน้าหลัก</span>
                    </button>
                    <button
                      onClick={() => { router.push('/characters'); setMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <UsersIcon className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                      <span className="text-gray-700 dark:text-slate-200">คาแรกเตอร์</span>
                    </button>
                    {report && (
                      <button
                        onClick={() => { setShowReport(true); setMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-amber-500/10 transition-colors text-left"
                      >
                        <FlagIcon className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-300">ดูรายงาน</span>
                      </button>
                    )}
                    <button
                      onClick={() => { router.push('/profile'); setMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <UserIconUI className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                      <span className="text-gray-700 dark:text-slate-200">โปรไฟล์</span>
                    </button>

                    {(messages.length > 0 || conversationLogRef.current.length > 0) && (
                      <button
                        onClick={() => { finalizeAndReport(); setMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 transition-colors text-left"
                      >
                        <StopIconUI className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-bold">จบบทสนทนา</span>
                      </button>
                    )}

                    <div className="h-px bg-gray-200 dark:bg-slate-700 mx-4"></div>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left text-red-500 dark:text-red-400"
                    >
                      <LogOutIcon className="w-5 h-5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* =================== TEXT MODE - Dark Theme =================== */}
        {mode === 'text' && (
          <div className="flex-1 flex flex-col pt-20 overflow-hidden">
            <main className="flex-1 overflow-y-auto min-h-0">
              <div className="max-w-lg mx-auto px-4 py-4 pb-24">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 p-3">
                      <KooJaiIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">เริ่มคุยกับ KooJai</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">พิมพ์ข้อความเพื่อเริ่มสนทนา หรือกดปุ่ม &ldquo;พูดคุย&rdquo; เพื่อคุยด้วยเสียง</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 p-1.5 flex-shrink-0">
                          <KooJaiIcon className="w-full h-full text-white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-bl-md shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.contentType === 'voice' && (
                          <span className="text-xs opacity-60 mt-1 block">🎤</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isSending && (
                  <div className="flex justify-start mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 p-1.5">
                      <KooJaiIcon className="w-full h-full text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Text Input Footer - Dark Theme */}
            <footer className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 fixed bottom-0 left-0 right-0 z-20">
              <div className="max-w-lg mx-auto px-4 py-3">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="พิมพ์ข้อความ..."
                      className="w-full px-4 py-3 bg-transparent outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                      rows={1}
                      disabled={isSending}
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendText}
                    disabled={!inputText.trim() || isSending}
                    className={`p-3 rounded-full transition-all ${
                      inputText.trim() && !isSending
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <SendIconUI className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* =================== VOICE MODE - Dark Theme =================== */}
        {mode === 'voice' && (
          <main className="flex-1 flex flex-col items-center justify-between w-full h-full pt-20 pb-10">
            {/* Welcome Text */}
            <div className="w-full text-center z-10 px-6 h-12 flex items-end justify-center">
              {!isLive && !isConnecting && (
                <div className="animate-slide-up">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {lastMemory || messages.length > 0 ? "กลับมาคุยกันต่อนะ..." : "สวัสดี... วันนี้เป็นไงบ้าง?"}
                  </h2>
                  <p className="text-sm font-normal text-gray-500 dark:text-slate-400 mt-1">กดปุ่มไมค์เพื่อเริ่มคุยได้เลยนะ</p>
                </div>
              )}
              {isConnecting && (
                <h2 className="text-lg text-gray-400 dark:text-slate-400 animate-pulse font-medium">กำลังเชื่อมต่อ...</h2>
              )}
            </div>

            {/* Visualizer */}
            <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
              <Visualizer isActive={isLive} volume={volume} source={speakerSource} />
            </div>

            {/* Transcript & Controls - Using unified messages */}
            <div className="w-full flex flex-col items-center justify-end z-20 space-y-6">
              <div className="w-full px-6 h-32 flex flex-col justify-end items-center">
                <div ref={scrollRef} className="w-full max-w-2xl max-h-32 overflow-y-auto no-scrollbar flex flex-col items-center space-y-4 text-center">
                  {/* Show last message or current stream */}
                  {(messages.length > 0 || currentStreamText) && isLive ? (
                    <div className="w-full py-2">
                      <span className={`inline-block px-6 py-4 rounded-3xl text-lg font-medium leading-relaxed transition-all duration-300 shadow-lg border
                        ${currentStreamRole === 'user' 
                          ? 'bg-blue-500 text-white border-blue-500/50' 
                          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700'}`}>
                        {currentStreamText || messages[messages.length - 1]?.content}
                    </span>
                  </div>
                ) : (
                  isLive && !isConnecting && (
                    <p className="text-gray-400 dark:text-slate-500 text-lg animate-pulse">...</p>
                  )
                )}
              </div>
            </div>

            {/* Mic Button - Dark Theme */}
            <div className="pb-6">
              {!isLive ? (
                <button
                  onClick={startSession}
                  disabled={isConnecting}
                  className={`group flex items-center justify-center w-20 h-20 rounded-full shadow-xl transition-all duration-300
                    ${isConnecting 
                      ? 'bg-gray-200 dark:bg-slate-800 cursor-not-allowed border-2 border-gray-300 dark:border-slate-700' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 hover:scale-110 shadow-blue-500/30 ring-4 ring-blue-500/20'}`}
                >
                  {isConnecting ? (
                    <div className="w-6 h-6 border-2 border-gray-400 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    <div className="text-white"><MicLargeIcon /></div>
                  )}
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="group flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-400 rounded-full shadow-xl shadow-red-500/30 transition-all duration-300 ring-4 ring-red-500/20"
                >
                  <div className="text-white group-hover:scale-110 transition-transform"><StopLargeIcon /></div>
                </button>
              )}
            </div>
          </div>
          </main>
        )}

        {/* Analyzing Overlay - Dark Theme */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">กำลังบันทึกความทรงจำ...</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">ไว้คุยกันใหม่นะ</p>
          </div>
        )}

        {/* Overlays */}
        {renderHealingCard()}
        {renderTeacherReport()}
      </div>
    </ProtectedRoute>
  );
}

// Loading component for Suspense fallback - Dark Theme
function ChatLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-500 dark:text-slate-400">กำลังโหลด...</p>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatPage />
    </Suspense>
  );
}