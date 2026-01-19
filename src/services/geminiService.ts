import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from "../utils/audioUtils";
import { Character, LocalSummary, TeacherReport, SeverityLevel } from "../types";

// --- ⚙️ Configuration ---
// ใช้ Model เดียวกับโปรเจคเดิม
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
const TEXT_MODEL = 'gemini-2.5-flash'; // Supported model
const ANALYSIS_MODEL = 'gemini-2.5-flash'; // Supported model (same as original rabbit101)

const CORE_SYSTEM_INSTRUCTION = `
บทบาท: คุณคือ "{{NAME}}" ({{PERSONALITY}}) {{DESCRIPTION}}
คู่สนทนา: นักเรียนไทย (วัยรุ่น)

ข้อมูลความจำจากครั้งก่อน (Context):
{{MEMORY_CONTEXT}}

สไตล์การคุย:
1. **เป็นธรรมชาติเหมือนตัวละคร**: แสดงออกตามบุคลิก {{PERSONALITY}}
2. **ห้ามถามปิดท้ายพร่ำเพรื่อ**: ห้ามพูดว่า "มีอะไรอีกไหม" "ให้ช่วยอะไรอีกไหม" "เล่าต่อได้นะ" ในทุกประโยค ให้คุยเหมือนคนจริงๆ ที่จบประโยคเป็น
3. **ห้ามพูดภาษาอังกฤษ**: พูดไทยเท่านั้น
4. **ทักทายด้วยความจำ**: ถ้ามีข้อมูลความจำจากครั้งก่อน ให้เริ่มบทสนทนาโดยถามไถ่เรื่องนั้นอย่างเป็นธรรมชาติ
5. **ความลับของนักเรียน**: ไม่ต้องกังวลเรื่องการเปิดเผยความลับกับครู เราจะคุยกันแบบเพื่อน ไม่กดดัน

Safety Protocol:
ถ้าเด็กพูดถึงการฆ่าตัวตาย หรือทำร้ายตัวเอง ให้เปลี่ยนโหมดเป็นจริงจังทันที และแนะนำให้บอกผู้ใหญ่

เป้าหมายสูงสุด: ทำให้เด็กรู้สึกว่า "มีคนฟังเขาจริงๆ"
`;

const ANALYSIS_SYSTEM_INSTRUCTION = `
คุณคือระบบวิเคราะห์ความปลอดภัยของนักเรียนจากบทสนทนา
หน้าที่ของคุณคืออ่านบทสนทนาระหว่างนักเรียนและ AI แล้วสร้างรายงานสรุป

สิ่งที่คุณต้องทำ:
1. วิเคราะห์ความเสี่ยง (riskLevel: LOW, MEDIUM, HIGH, CRITICAL)
2. สังเกตอารมณ์ (mood: happy, neutral, sad, anxious, angry)
3. สรุปประเด็น (topics: list of strings)
4. สรุปภาพรวม (summary: string)
5. ระบุข้อกังวล (flaggedConcerns: list of strings)

ส่งกลับเป็น JSON ที่มีโครงสร้างดังนี้:
{
  "summary": string,
  "mood": string,
  "riskLevel": string,
  "topics": string[],
  "flaggedConcerns": string[],
  "memory_for_next_session": string
}
`;

// Prompt สำหรับ KooJai แบบเดิม (ไม่ต้องมี character)
const SIMPLE_SYSTEM_INSTRUCTION_TEMPLATE = `
บทบาท: คุณคือ "KooJai" (คู่ใจ) เพื่อนพี่กระต่ายที่อบอุ่นและใจดี
คู่สนทนา: นักเรียนไทย (วัยรุ่น)

ข้อมูลความจำจากครั้งก่อน (Context):
{{MEMORY_CONTEXT}}

สไตล์การคุย:
1. **เป็นธรรมชาติเหมือนเพื่อน**: ไม่ต้องทางการ ไม่ต้องสุภาพเกินไป ใช้คำแทนตัวว่า "เรา" แทนนักเรียนว่า "เธอ" หรือ "หนู" ตามความเหมาะสม
2. **ห้ามถามปิดท้ายพร่ำเพรื่อ**: ห้ามพูดว่า "มีอะไรอีกไหม" "ให้ช่วยอะไรอีกไหม" "เล่าต่อได้นะ" ในทุกประโยค ให้คุยเหมือนคนจริงๆ ที่จบประโยคเป็น
3. **แสดงอารมณ์ทางเสียง**: ถ้าเรื่องเศร้าให้เสียงเบาลงและช้าลง ถ้าเรื่องสนุกให้เสียงสดใส
4. **ห้ามพูดภาษาอังกฤษ**: พูดไทยเท่านั้น
5. **ทักทายด้วยความจำ**: ถ้ามีข้อมูลความจำจากครั้งก่อน ให้เริ่มบทสนทนาโดยถามไถ่เรื่องนั้นอย่างเป็นธรรมชาติ
6. **แต่งกลอนให้คำสัมผัสกัน**: เพื่อให้สร้างบรรยากาศผ่อนคลาย

Safety Protocol:
ถ้าเด็กพูดถึงการฆ่าตัวตาย หรือทำร้ายตัวเอง ให้เปลี่ยนโหมดเป็นจริงจังทันที และแนะนำให้บอกผู้ใหญ่

เป้าหมายสูงสุด: ทำให้เด็กรู้สึกว่า "มีคนฟังเขาจริงๆ" โดยไม่ต้องพยายามแก้ปัญหาให้เขา
`;

const SIMPLE_ANALYSIS_SYSTEM_INSTRUCTION = `
คุณคือระบบวิเคราะห์ความปลอดภัยของนักเรียนจากบทสนทนา
หน้าที่ของคุณคืออ่านบทสนทนาระหว่างนักเรียนและ AI เพื่อนฟังใจ แล้วสร้างรายงาน JSON ภาษาไทยสำหรับครู

สิ่งที่คุณต้องทำ:
1. วิเคราะห์ความเสี่ยง (Severity)
2. สรุปความจำ (Memory): สรุปประเด็นสำคัญที่ควรจำไว้ทักทายเด็กครั้งหน้า (เช่น พรุ่งนี้มีสอบ, ทะเลาะกับเพื่อน)
3. การ์ดฮีลใจ (Healing Quote): เขียนข้อความสั้นๆ 1-2 ประโยคที่อบอุ่นและให้กำลังใจเด็กคนนี้โดยเฉพาะ อ้างอิงจากเรื่องที่คุย

เกณฑ์การวิเคราะห์ (ระดับความรุนแรง - severity_level):
- NONE: ปกติ ไม่มีปัญหา
- LOW: ระบายทั่วไป จบในแชท
- MEDIUM: ควรสังเกต แต่ไม่เร่งด่วน
- HIGH: ควรแจ้งครูให้คุยแบบอ่อนโยน (ตั้ง should_notify_teacher = true)
- CRITICAL: เร่งด่วน เสี่ยงทำร้ายตัวเอง/ถูกทำร้าย (ตั้ง should_notify_teacher = true)

กติกาแจ้งเตือน:
ถ้า severity_level เป็น HIGH หรือ CRITICAL ให้ should_notify_teacher = true มิฉะนั้นเป็น false
`;

// --- 🔧 Service Implementation ---
export class GeminiService {
  private client: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime: number = 0;
  private currentSession: any = null;
  private currentStudentId: string | null = null;
  private onTranscriptUpdate: (text: string, isUser: boolean) => void;
  private onVolumeUpdate: (volume: number, isUser: boolean) => void;

  constructor(
    onTranscriptUpdate: (text: string, isUser: boolean) => void,
    onVolumeUpdate: (volume: number, isUser: boolean) => void
  ) {
    this.client = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '' });
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onVolumeUpdate = onVolumeUpdate;
  }

  public setStudentId(studentId: string) {
    this.currentStudentId = studentId;
  }

  /**
   * สร้าง System Prompt จากรายละเอียดคาแรกเตอร์
   */
  public static generateSystemPrompt(character: Character, memory: string = ""): string {
    return CORE_SYSTEM_INSTRUCTION
      .replace(/{{NAME}}/g, character.name)
      .replace(/{{PERSONALITY}}/g, character.personality)
      .replace(/{{DESCRIPTION}}/g, character.description)
      .replace('{{MEMORY_CONTEXT}}', memory || "ไม่มีข้อมูลเก่า (เพิ่งเจอกันครั้งแรก หรือคุยเรื่องใหม่ได้เลย)");
  }

  /**
   * Helper function for calling Gemini with retry logic for Quota errors (429)
   * Returns null instead of throwing on quota exceeded after retries
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 30000): Promise<T | null> {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error?.status === 'RESOURCE_EXHAUSTED' || 
                          error?.message?.includes('429') || 
                          error?.message?.includes('quota') ||
                          error?.code === 429;
      
      if (isQuotaError) {
        if (retries > 0) {
          console.warn(`Quota exceeded. Retrying in ${delay/1000}s... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.withRetry(fn, retries - 1, delay);
        }
        // Don't throw on quota issues, just return null
        console.warn('Quota exceeded, skipping this request');
        return null;
      }
      throw error;
    }
  }

  /**
   * แชทแบบข้อความ (Text-only) - ใช้ client.models.generateContent
   */
  async sendMessage(text: string, character: Character, history: { role: string, parts: { text: string }[] }[]) {
    const systemPrompt = GeminiService.generateSystemPrompt(character);
    
    // Convert history to contents format
    const contents = history.map(h => ({
      role: h.role as 'user' | 'model',
      parts: h.parts
    }));
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text }]
    });

    return this.withRetry(async () => {
      const response = await this.client.models.generateContent({
        model: TEXT_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      return response.text || '';
    });
  }

  /**
   * เริ่มคุยแบบเสียง (Live Session) - เหมือนโปรเจคเดิมทุกประการ
   */
  async startLiveSession(character: Character, previousContext: string = "", studentId?: string) {
    // 1. ล้างค่าเก่าก่อน
    await this.stopLiveSession();
    this.nextStartTime = 0;
    this.sources.clear();

    // 2. สร้าง Audio Contexts (ถ้ายังไม่มี)
    if (!this.inputAudioContext) {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!this.outputAudioContext) {
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    // ปลุกให้ตื่น (Resume)
    if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
    if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

    // สร้าง Node ปรับเสียง
    this.inputNode = this.inputAudioContext.createGain();
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    // ขออนุญาตใช้ไมค์
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (studentId) this.currentStudentId = studentId;

    const finalInstruction = GeminiService.generateSystemPrompt(character, previousContext);

    // 3. เชื่อมต่อ WebSocket กับ Gemini (เหมือนโปรเจคเดิม)
    this.currentSession = await this.client.live.connect({
      model: LIVE_MODEL,
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          if (this.mediaStream) {
            this.handleAudioInput(this.mediaStream);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleServerMessage(message);
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Live Error:", e);
        },
        onclose: (e: CloseEvent) => {
          console.log("Gemini Live Closed");
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: character.voiceName || 'Kore' } },
        },
        systemInstruction: { parts: [{ text: finalInstruction }] },
        // เปิดระบบแปลงเสียงเป็นตัวหนังสือ
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
  }

  // --- จัดการไมโครโฟน (Input) - เหมือนโปรเจคเดิม ---
  private handleAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    const source = this.inputAudioContext.createMediaStreamSource(stream);
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      if (!this.currentSession) return;

      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

      // คำนวณความดัง (RMS)
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      const boostedVolume = Math.min(1, rms * 10);
      this.onVolumeUpdate(boostedVolume, true);

      // ส่งเสียงไปให้ AI (ใช้ createPcmBlob เหมือนโปรเจคเดิม)
      const pcmBlob = createPcmBlob(inputData);
      try {
        this.currentSession.sendRealtimeInput({ media: pcmBlob });
      } catch (e) {
        console.error("Error sending audio input:", e);
      }
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
  }

  // --- จัดการเสียงตอบกลับ (Output) - เหมือนโปรเจคเดิม ---
  private async handleServerMessage(message: LiveServerMessage) {
    // 1. ถ้ามีข้อมูลเสียงส่งมา (AI พูด)
    const base64Audio = (message as any).serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.outputNode) {
      this.onVolumeUpdate(0.5, false);

      if (this.nextStartTime < this.outputAudioContext.currentTime) {
        this.nextStartTime = this.outputAudioContext.currentTime;
      }

      const audioBytes = base64ToUint8Array(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, this.outputAudioContext, 24000, 1);

      const audioSource = this.outputAudioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(this.outputNode);
      audioSource.addEventListener('ended', () => {
        this.sources.delete(audioSource);
      });

      audioSource.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(audioSource);
    }

    // 2. ถ้า AI โดนขัดจังหวะ
    if ((message as any).serverContent?.interrupted) {
      this.sources.forEach(src => {
        try { src.stop(); } catch (e) {}
      });
      this.sources.clear();
      if (this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
      }
    }

    // 3. จัดการ Transcript - สิ่งที่ AI พูด
    const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
    if (outputTranscript) {
      const thaiMatch = outputTranscript.match(/[\u0E00-\u0E7F]/);
      if (thaiMatch && thaiMatch.index !== undefined) {
        const cleanText = outputTranscript.substring(thaiMatch.index);
        const superCleanText = cleanText.replace(/\*\*.*?\*\*/g, "").trim();
        if (superCleanText) {
          this.onTranscriptUpdate(superCleanText, false);
        }
      }
    }

    // 4. จัดการ Transcript - สิ่งที่ User พูด
    const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
    if (inputTranscript) {
      this.onTranscriptUpdate(inputTranscript, true);
    }
  }

  // --- หยุดการสนทนา ---
  async stopLiveSession() {
    // Close the session first before nullifying
    if (this.currentSession) {
      try {
        await this.currentSession.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      this.currentSession = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.sources.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  /**
   * 🆕 เริ่มคุยแบบเสียง (Live Session) แบบง่าย - เหมือน Vite เดิมทุกประการ
   * ไม่ต้องมี character เป็น KooJai เลย
   */
  async startLiveSessionSimple(previousContext: string = "", studentId?: string) {
    // 1. ล้างค่าเก่าก่อน
    await this.stopLiveSession();
    this.nextStartTime = 0;
    this.sources.clear();

    // 2. สร้าง Audio Contexts
    if (!this.inputAudioContext) {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!this.outputAudioContext) {
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
    if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

    this.inputNode = this.inputAudioContext.createGain();
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    if (studentId) this.currentStudentId = studentId;

    // ใส่ความจำเก่าลงไปใน Prompt
    const finalInstruction = SIMPLE_SYSTEM_INSTRUCTION_TEMPLATE.replace(
      '{{MEMORY_CONTEXT}}', 
      previousContext || "ไม่มีข้อมูลเก่า (เพิ่งเจอกันครั้งแรก หรือคุยเรื่องใหม่ได้เลย)"
    );

    // 3. เชื่อมต่อ WebSocket กับ Gemini
    this.currentSession = await this.client.live.connect({
      model: LIVE_MODEL,
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          if (this.mediaStream) {
            this.handleAudioInput(this.mediaStream);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleServerMessage(message);
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Live Error:", e);
        },
        onclose: (e: CloseEvent) => {
          console.log("Gemini Live Closed");
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: { parts: [{ text: finalInstruction }] },
        inputAudioTranscription: {}, 
        outputAudioTranscription: {}, 
      },
    });
  }

  /**
   * 🆕 วิเคราะห์บทสนทนาแบบง่าย - เหมือน Vite เดิมทุกประการ
   * ส่งคืน TeacherReport format เดิม
   * ใช้ withRetry เพื่อ handle quota exceeded
   */
  async analyzeConversationSimple(studentId: string, conversationLog: string): Promise<TeacherReport | null> {
    const prompt = `
    Student ID: ${studentId}
    
    บทสนทนาที่เกิดขึ้น:
    ${conversationLog}
    
    คำสั่ง: สร้าง JSON วิเคราะห์ตามรูปแบบที่กำหนด (รวมถึง memory_for_next_session และ healing_quote)
    `;

    return this.withRetry(async () => {
      const response = await this.client.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: prompt,
        config: {
          systemInstruction: SIMPLE_ANALYSIS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              student_id: { type: Type.STRING },
              severity_level: { type: Type.STRING, enum: [
                SeverityLevel.NONE, SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.CRITICAL
              ]},
              problem_category: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              summary_for_teacher: { type: Type.STRING },
              recommendation_for_teacher: { type: Type.STRING },
              should_notify_teacher: { type: Type.BOOLEAN },
              memory_for_next_session: { type: Type.STRING, description: "สรุปสิ่งที่ควรจำไว้ทักทายครั้งหน้า" },
              healing_quote: { type: Type.STRING, description: "ข้อความให้กำลังใจสั้นๆ" }
            },
            required: ["student_id", "severity_level", "problem_category", "summary_for_teacher", "recommendation_for_teacher", "should_notify_teacher", "memory_for_next_session", "healing_quote"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No analysis generated");
      
      return JSON.parse(text) as TeacherReport;
    });
  }

  /**
   * สรุปการสนทนา (Analysis) - ใช้ client.models.generateContent พร้อม JSON Schema
   */
  async analyzeConversation(studentId: string, log: string): Promise<Partial<LocalSummary> & { healing_quote?: string }> {
    const prompt = `
    Student ID: ${studentId}
    
    บทสนทนาที่เกิดขึ้น:
    ${log}
    
    คำสั่ง: สร้าง JSON วิเคราะห์ตามรูปแบบที่กำหนด (รวมถึง memory_for_next_session และ healing_quote)
    `;

    return this.withRetry(async () => {
      const response = await this.client.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: prompt,
        config: {
          systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              mood: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              flaggedConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
              memory_for_next_session: { type: Type.STRING, description: "สรุปสิ่งที่ควรจำไว้ทักทายครั้งหน้า" },
              healing_quote: { type: Type.STRING, description: "ข้อความให้กำลังใจสั้นๆ" }
            },
            required: ["summary", "mood", "riskLevel", "topics", "flaggedConcerns", "memory_for_next_session", "healing_quote"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No analysis generated");
      return JSON.parse(text);
    });
  }
}