'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Visualizer from '@/components/Visualizer';
import { Character, LocalMessage, Chat, SeverityLevel } from '@/types';
import { 
  getCharacter, 
  createChat, 
  getChatMessages, 
  saveLocalMessage, 
  getChats,
  updateChat 
} from '@/utils/indexedDb';
import { GeminiService } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronLeftIcon,
  SendIcon,
  MicIcon,
  ChatIcon,
  PhoneIcon,
  PhoneOffIcon,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';

/**
 * 💬🎤 Character Chat Page - Dark Theme
 * รองรับทั้ง Text Mode และ Voice Mode สลับได้
 */

type ChatMode = 'text' | 'voice';

// =====================
// Chat Bubble Component
// =====================
function ChatBubble({ 
  message, 
  avatar,
  isStreaming = false 
}: { 
  message: LocalMessage | { role: string; content: string }; 
  avatar?: string;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && avatar && (
        <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-lg mr-2 flex-shrink-0 border border-violet-500/30">
          {avatar}
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-[#CCFF00] text-[#0f0d1a] rounded-br-md'
            : 'bg-white/10 text-white border border-white/10 rounded-bl-md backdrop-blur-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && <span className="animate-pulse">▋</span>}
        </p>
      </div>
    </div>
  );
}

// =====================
// Risk Detection Helpers
// =====================
function checkForRisk(aiResponse: string): { level: string; concern: string } | null {
  const riskMatch = aiResponse.match(/\[RISK_FLAG:\s*\{([^}]+)\}\]/);
  if (riskMatch) {
    try {
      const jsonStr = `{${riskMatch[1]}}`;
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }
  return null;
}

function cleanResponse(response: string): string {
  return response.replace(/\[RISK_FLAG:[^\]]+\]/g, '').trim();
}

// =====================
// Message Interface for Voice Mode
// =====================
interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFinal?: boolean;
}

// =====================
// Main Component
// =====================
function CharacterChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const characterId = resolvedParams.id;
  
  // Shared State
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<ChatMode>('text');
  
  // 🔥 UNIFIED MESSAGES - ใช้ร่วมกันทั้ง Text และ Voice
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Voice Mode State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [speakerSource, setSpeakerSource] = useState<'user' | 'ai'>('user');
  const [currentStreamText, setCurrentStreamText] = useState('');
  const [currentStreamRole, setCurrentStreamRole] = useState<'user' | 'assistant'>('user');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const conversationLogRef = useRef<string[]>([]);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChatRef = useRef<Chat | null>(null);
  const characterRef = useRef<Character | null>(null);
  const pendingMessageRef = useRef<{ text: string; isUser: boolean } | null>(null);

  // Keep refs updated
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);
  
  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  // =====================
  // Initialize
  // =====================
  useEffect(() => {
    const init = async () => {
      if (!characterId || !user?.student_id) return;

      try {
        // Load character
        const char = await getCharacter(characterId);
        if (!char) {
          router.push('/characters');
          return;
        }
        setCharacter(char);

        // Load or create chat
        const existingChats = await getChats(characterId);
        let chat: Chat;
        
        if (existingChats.length > 0) {
          chat = existingChats[0];
          const chatMessages = await getChatMessages(chat.id);
          setMessages(chatMessages);
        } else {
          chat = {
            id: uuidv4(),
            characterId,
            studentId: user.student_id,
            title: `สนทนากับ ${char.name}`,
            mode: 'text',
            lastMessageAt: Date.now(),
            isSummarized: false,
            createdAt: Date.now(),
          };
          await createChat(chat);
        }
        setCurrentChat(chat);

      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [characterId, user, router]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamText]);

  // =====================
  // Transcript Handler for Voice Mode - UNIFIED DATA
  // =====================
  
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
        `${pending.isUser ? 'นักเรียน' : char?.name || 'AI'}: ${pending.text.trim()}`
      );
      
      // Save to IndexedDB
      saveLocalMessage(newMessage).catch(console.error);
      console.log('💾 Saved voice message:', newMessage.content.substring(0, 50));
    }
    
    pendingMessageRef.current = null;
    setCurrentStreamText('');
  }, []);
  
  const handleTranscript = useCallback((text: string, isUser: boolean) => {
    // Update who is currently speaking
    setSpeakerSource(isUser ? 'user' : 'ai');
    setCurrentStreamRole(isUser ? 'user' : 'assistant');
    
    // If speaker changed, save previous message first
    if (pendingMessageRef.current && pendingMessageRef.current.isUser !== isUser) {
      savePendingVoiceMessage();
    }
    
    // Accumulate streaming text
    setCurrentStreamText(prev => {
      const newText = prev ? `${prev} ${text}`.trim() : text;
      // Update pending message ref
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

  // =====================
  // Voice Mode Controls
  // =====================
  const startVoiceChat = async () => {
    if (!character || !user?.student_id) return;
    
    setIsConnecting(true);
    try {
      // Create new GeminiService for voice
      geminiServiceRef.current = new GeminiService(
        handleTranscript,
        (v) => setVolume(v)
      );

      // Build system instruction with character personality
      // 🔥 Include previous conversation context
      const recentMessages = messages.slice(-10).map(m => 
        `${m.role === 'user' ? 'นักเรียน' : character.name}: ${m.content}`
      ).join('\n');
      
      const contextSection = recentMessages 
        ? `\n\nบทสนทนาก่อนหน้า (สำหรับบริบท):\n${recentMessages}\n` 
        : '';

      const characterSystemInstruction = `
คุณคือ "${character.name}" - ${character.personality}

คำอธิบาย: ${character.description || ''}
เสียง: ${character.voiceGender === 'male' ? 'ชาย' : 'หญิง'}
${contextSection}
กฎสำคัญ:
- พูดเป็นภาษาไทยเสมอ
- ใช้บุคลิกและน้ำเสียงตามที่กำหนด
- รับฟังและสนับสนุนเด็กๆ
- ถ้าเด็กเล่าปัญหาร้ายแรง ให้เพิ่ม [RISK_FLAG: { "level": "HIGH", "concern": "สรุปปัญหา" }]
`;

      await geminiServiceRef.current.startLiveSessionSimple(characterSystemInstruction);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      alert('ไม่สามารถเริ่มการสนทนาเสียงได้ กรุณาลองใหม่');
    } finally {
      setIsConnecting(false);
    }
  };

  const endVoiceChat = async () => {
    if (geminiServiceRef.current) {
      await geminiServiceRef.current.stopLiveSession();
      geminiServiceRef.current = null;
    }
    setIsConnected(false);
    setVolume(0);
    setSpeakerSource('user');
    
    // Clear any pending stream timeout
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    
    // Save any pending voice message
    savePendingVoiceMessage();
    
    // Analyze voice conversation if needed
    if (conversationLogRef.current.length > 0) {
      await analyzeVoiceConversation();
    }
  };

  const analyzeVoiceConversation = async () => {
    if (!user?.student_id || !geminiServiceRef.current) return;
    
    const log = conversationLogRef.current.join('\n');
    if (!log.trim()) return;

    try {
      const analysis = await geminiServiceRef.current.analyzeConversationSimple(
        user.student_id,
        log
      );

      if (analysis && analysis.should_notify_teacher) {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis),
        });
        console.log('Voice conversation report sent');
      }
    } catch (error) {
      console.error('Failed to analyze voice conversation:', error);
    }
  };

  // =====================
  // Text Mode: Send Message
  // =====================
  const handleSendText = async () => {
    if (!inputText.trim() || !character || !currentChat || !user?.student_id) return;

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
      await saveLocalMessage(userMsg);
      setMessages(prev => [...prev, userMsg]);

      // Build conversation history - 🔥 ใช้ unified messages
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Send to Gemini
      const response = await geminiServiceRef.current.sendMessage(
        userMessage,
        character,
        history
      );

      if (response) {
        const risk = checkForRisk(response);
        const cleanedResponse = cleanResponse(response);

        // Save AI response
        const aiMsg: LocalMessage = {
          id: uuidv4(),
          chatId: currentChat.id,
          role: 'assistant',
          content: cleanedResponse,
          contentType: 'text',
          timestamp: Date.now(),
        };
        await saveLocalMessage(aiMsg);
        setMessages(prev => [...prev, aiMsg]);

        // Send risk report if HIGH/CRITICAL
        if (risk && (risk.level === 'HIGH' || risk.level === 'CRITICAL')) {
          await sendRiskReport(risk, userMessage, cleanedResponse);
        }
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
    } finally {
      setIsSending(false);
    }
  };

  // =====================
  // Risk Report
  // =====================
  const sendRiskReport = async (
    risk: { level: string; concern: string },
    userMessage: string,
    aiResponse: string
  ) => {
    if (!user?.student_id || !character || !geminiServiceRef.current) return;

    try {
      const recentMessages = messages.slice(-10);
      const conversationLog = [
        ...recentMessages.map(m => `${m.role === 'user' ? 'นักเรียน' : 'AI'}: ${m.content}`),
        `นักเรียน: ${userMessage}`,
        `AI: ${aiResponse}`
      ].join('\n');

      const analysis = await geminiServiceRef.current.analyzeConversation(
        user.student_id,
        conversationLog
      );

      if (analysis) {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: user.student_id,
            severity_level: risk.level,
            problem_category: analysis.topics || [],
            summary_for_teacher: analysis.summary || risk.concern,
            recommendation_for_teacher: analysis.flaggedConcerns?.join(', ') || '',
            should_notify_teacher: true,
            memory_for_next_session: analysis.memory_for_next_session || '',
            healing_quote: analysis.healing_quote || '',
          }),
        });
        console.log('Risk report sent:', risk.level);
      }
    } catch (error) {
      console.error('Failed to send risk report:', error);
    }
  };

  // =====================
  // Mode Toggle
  // =====================
  const toggleMode = () => {
    if (mode === 'voice' && isConnected) {
      endVoiceChat();
    }
    setMode(prev => prev === 'text' ? 'voice' : 'text');
  };

  // =====================
  // Keyboard Handler
  // =====================
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // =====================
  // Loading State
  // =====================
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f0d1a] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#CCFF00]/30 border-t-[#CCFF00] rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!character) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f0d1a] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🤷</span>
          </div>
          <p className="text-white/60">ไม่พบคาแรกเตอร์</p>
          <Button 
            variant="ghost" 
            className="mt-4"
            onClick={() => router.push('/characters')}
          >
            กลับหน้ารายการ
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  // =====================
  // RENDER
  // =====================
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0d1a] flex flex-col">
        {/* Header */}
        <header className="bg-[#0f0d1a]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center space-x-3">
            <button
              onClick={() => router.push('/characters')}
              className="p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <ChevronLeftIcon />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center text-xl border border-violet-500/30">
              {character.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white truncate">{character.name}</h1>
              <p className="text-xs text-white/40 truncate flex items-center">
                {mode === 'text' ? (
                  <><ChatIcon className="w-3 h-3 mr-1" /> พิมพ์คุย</>
                ) : (
                  <><MicIcon className="w-3 h-3 mr-1" /> พูดคุย</>
                )}
              </p>
            </div>
            
            {/* Mode Toggle Button */}
            <button
              onClick={toggleMode}
              disabled={isConnecting}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'text'
                  ? 'bg-[#CCFF00]/20 text-[#CCFF00] hover:bg-[#CCFF00]/30 border border-[#CCFF00]/30'
                  : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30'
              }`}
            >
              {mode === 'text' ? (
                <>
                  <MicIcon className="w-4 h-4" />
                  <span>พูดคุย</span>
                </>
              ) : (
                <>
                  <ChatIcon className="w-4 h-4" />
                  <span>พิมพ์คุย</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* =================== TEXT MODE =================== */}
        {mode === 'text' && (
          <>
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-lg mx-auto px-4 py-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl border border-violet-500/30">
                      {character.avatar}
                    </div>
                    <h3 className="font-medium text-white mb-2">เริ่มคุยกับ {character.name}</h3>
                    <p className="text-sm text-white/50">พิมพ์ข้อความเพื่อเริ่มสนทนา</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatBubble 
                      key={msg.id} 
                      message={msg} 
                      avatar={msg.role === 'assistant' ? character.avatar : undefined}
                    />
                  ))
                )}
                
                {isSending && (
                  <div className="flex justify-start mb-3">
                    <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-lg mr-2 border border-violet-500/30">
                      {character.avatar}
                    </div>
                    <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md border border-white/10 backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#CCFF00]/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#CCFF00]/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#CCFF00]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Text Input Footer */}
            <footer className="bg-[#0f0d1a]/95 backdrop-blur-xl border-t border-white/5 sticky bottom-0">
              <div className="max-w-lg mx-auto px-4 py-3">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 bg-white/5 rounded-2xl border border-white/10">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="พิมพ์ข้อความ..."
                      className="w-full px-4 py-3 bg-transparent outline-none resize-none text-white placeholder-white/40"
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
                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0f0d1a]'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <SendIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </footer>
          </>
        )}

        {/* =================== VOICE MODE =================== */}
        {mode === 'voice' && (
          <main className="flex-1 flex flex-col">
            {!isConnected ? (
              /* Voice Mode: Not Connected */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Decorative Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-40 right-10 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl"></div>
                </div>
                
                <div className="w-32 h-32 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl border border-violet-500/30 relative z-10">
                  {character.avatar}
                </div>
                <h2 className="text-xl font-bold text-white mb-2 relative z-10">{character.name}</h2>
                <p className="text-white/50 text-center mb-8 max-w-xs relative z-10">
                  กดปุ่มด้านล่างเพื่อเริ่มสนทนาด้วยเสียงกับ {character.name}
                </p>
                
                <Button
                  onClick={startVoiceChat}
                  disabled={isConnecting}
                  isLoading={isConnecting}
                  className="relative z-10"
                  size="lg"
                  leftIcon={<PhoneIcon className="w-5 h-5" />}
                >
                  {isConnecting ? 'กำลังเชื่อมต่อ...' : 'เริ่มพูดคุย'}
                </Button>
              </div>
            ) : (
              /* Voice Mode: Connected */
              <>
                {/* Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  {/* Decorative Background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#CCFF00]/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Avatar with Volume Rings */}
                  <div className="relative mb-8 z-10">
                    {/* Outer pulsing rings */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                      style={{ 
                        transform: `scale(${1.3 + volume * 0.5})`,
                        opacity: 0.1 + volume * 0.2,
                        transition: 'all 0.15s ease-out'
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#CCFF00] to-lime-400"
                      style={{ 
                        transform: `scale(${1.2 + volume * 0.4})`,
                        opacity: 0.1 + volume * 0.2,
                        transition: 'all 0.12s ease-out'
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                      style={{ 
                        transform: `scale(${1.1 + volume * 0.3})`,
                        opacity: 0.15 + volume * 0.25,
                        transition: 'all 0.1s ease-out'
                      }}
                    />
                    
                    {/* Main Avatar Circle */}
                    <div className="w-36 h-36 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center text-6xl shadow-2xl relative z-10 border border-white/20 backdrop-blur-sm">
                      {character.avatar}
                    </div>
                    
                    {/* Speaker Indicator */}
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20 transition-all ${
                      speakerSource === 'user' 
                        ? 'bg-[#CCFF00] text-[#0f0d1a]' 
                        : 'bg-violet-500 text-white'
                    }`}>
                      {speakerSource === 'user' ? (
                        <span className="flex items-center"><MicIcon className="w-3 h-3 mr-1" /> คุณกำลังพูด</span>
                      ) : (
                        <span className="flex items-center"><ChatIcon className="w-3 h-3 mr-1" /> {character.name}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Visualizer Component */}
                  <div className="z-10">
                    <Visualizer 
                      isActive={isConnected} 
                      volume={volume} 
                      source={speakerSource} 
                    />
                  </div>
                  
                  {/* Status Text */}
                  <p className="text-white/60 mt-6 font-medium text-lg z-10">
                    {volume > 0.1 ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse"></span>
                        <span>กำลังฟัง...</span>
                      </span>
                    ) : (
                      <span className="text-white/40">พูดได้เลย ฉันฟังอยู่นะ</span>
                    )}
                  </p>
                </div>

                {/* Chat History + Streaming Text - Scrollable */}
                <div className="max-h-56 overflow-y-auto bg-[#0f0d1a]/90 backdrop-blur-xl border-t border-white/5">
                  <div className="max-w-lg mx-auto px-4 py-3">
                    {/* Show all unified messages (both text & voice history) */}
                    {messages.slice(-5).map((msg) => (
                      <ChatBubble 
                        key={msg.id} 
                        message={msg} 
                        avatar={msg.role === 'assistant' ? character.avatar : undefined}
                      />
                    ))}
                    
                    {/* Current streaming text */}
                    {currentStreamText && (
                      <ChatBubble 
                        message={{ role: currentStreamRole, content: currentStreamText }} 
                        avatar={currentStreamRole === 'assistant' ? character.avatar : undefined}
                        isStreaming={true}
                      />
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* End Call Footer */}
                <footer className="bg-[#0f0d1a]/95 backdrop-blur-xl border-t border-white/5 py-5">
                  <div className="flex justify-center">
                    <button
                      onClick={endVoiceChat}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95"
                    >
                      <PhoneOffIcon className="w-5 h-5" />
                      <span>วางสาย</span>
                    </button>
                  </div>
                </footer>
              </>
            )}
          </main>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default CharacterChatPage;
