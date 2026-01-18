/**
 * 📘 Types & Interfaces
 * ไฟล์นี้เหมือน "พจนานุกรม" ที่บอกว่าข้อมูลแต่ละก้อนหน้าตาเป็นยังไง
 */

// Enum: ใช้เมื่อค่าที่เป็นไปได้มีจำกัด (เช่น ระดับความรุนแรง)
export enum SeverityLevel {
  NONE = 'NONE',         // ปกติ
  LOW = 'LOW',           // ต่ำ
  MEDIUM = 'MEDIUM',     // ปานกลาง
  HIGH = 'HIGH',         // สูง (อันตราย)
  CRITICAL = 'CRITICAL'  // วิกฤต (ต้องรีบช่วย)
}

// Interface: แบบแปลนของ Object (TeacherReport)
export interface TeacherReport {
  student_id: string;
  severity_level: SeverityLevel;
  problem_category: string[];        // หมวดหมู่ปัญหา เช่น ['การเรียน', 'เพื่อน']
  summary_for_teacher: string;       // สรุปสั้นๆ ให้ครูอ่าน
  recommendation_for_teacher: string; // คำแนะนำว่าครูควรทำไง
  should_notify_teacher: boolean;    // แจ้งเตือนครูไหม?
  
  // ฟีเจอร์ใหม่
  memory_for_next_session: string;   // สิ่งที่ AI ควรจำไว้ทักทายครั้งหน้า
  healing_quote: string;             // คำคมฮีลใจสำหรับนักเรียน
}

// แบบแปลนข้อความแชท
export interface ChatMessage {
  role: 'user' | 'model'; // ใครพูด? (คน หรือ AI)
  text: string;
  timestamp: number;      // เวลาที่พูด (ใช้ Date.now())
}

// แบบแปลนบันทึกอารมณ์
export interface MoodEntry {
  id?: number;            // ID ใน Database
  student_id: string;
  mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'tired';
  timestamp: number;
}

// ========================================
// 🎭 CHARACTER CHAT TYPES
// ========================================

export interface Character {
  id: string;                    // UUID
  studentId: string;             // รหัสนักเรียนเจ้าของ
  name: string;                  // ชื่อคาแรกเตอร์ เช่น "พี่กระต่าย", "น้องหมี"
  avatar: string;                // รูปโปรไฟล์ (emoji หรือ URL)
  personality: string;           // บุคลิก เช่น "ร่าเริง", "ใจดี", "เท่ห์"
  description: string;           // คำอธิบายตัวละคร
  voiceGender: 'male' | 'female'; // เพศของเสียง
  voiceName: string;             // ชื่อเสียง Gemini เช่น "Aoede", "Charon"
  systemPrompt: string;          // Prompt สำหรับ AI
  createdAt: number;
  updatedAt: number;
}

export interface Chat {
  id: string;                    // UUID
  characterId: string;           // คาแรกเตอร์ที่คุยด้วย
  studentId: string;             // รหัสนักเรียน
  title: string;                 // หัวข้อ (สร้างอัตโนมัติจากข้อความแรก)
  mode: 'text' | 'voice';        // โหมดการสนทนา
  lastMessageAt: number;         // ข้อความล่าสุดเมื่อไหร่
  isSummarized: boolean;         // สรุปไปให้ครูแล้วหรือยัง
  createdAt: number;
}

export interface LocalMessage {
  id: string;                    // UUID
  chatId: string;                // อยู่ในห้องแชตไหน
  role: 'user' | 'assistant';    // ใครพูด
  content: string;               // เนื้อหา (Text)
  contentType: 'text' | 'voice'; // ประเภท
  timestamp: number;
}

export interface LocalSummary {
  id: string;
  studentId: string;
  characterId: string;
  chatId: string;
  summary: string;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry';
  riskLevel: SeverityLevel;
  topics: string[];
  flaggedConcerns: string[];
  messageCount: number;
  duration: number;
  memory_for_next_session: string;  // สิ่งที่ AI ควรจำไว้ทักทายครั้งหน้า
  createdAt: number;
}

// ========================================
// 🔐 AUTH SYSTEM TYPES
// ========================================

// ประเภทผู้ใช้
export type UserRole = 'student' | 'teacher' | 'admin' | 'counselor';

// ข้อมูลนักเรียน
export interface Student {
  id?: number;
  student_id: string;           // รหัสนักเรียน (unique)
  email: string;
  password_hash?: string;       // ไม่ส่งไป frontend
  first_name: string;
  last_name: string;
  nickname?: string;
  grade_level: string;          // ระดับชั้น เช่น ม.1, ม.2
  classroom?: string;           // ห้อง เช่น 1/1, 1/2
  birth_date?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ข้อมูลครู/แอดมิน
export interface Teacher {
  id?: number;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

// Session ที่ใช้ตรวจสอบการ login
export interface Session {
  id?: number;
  user_id: number;
  user_type: 'student' | 'teacher';
  token: string;
  expires_at: string;
  created_at?: string;
}

// ข้อมูล User ที่ใช้ใน AuthContext (รวม Student และ Teacher)
export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'teacher';
  // เฉพาะ Student
  student_id?: string;
  nickname?: string;
  grade_level?: string;
  classroom?: string;
  profile_image_url?: string;
  // เฉพาะ Teacher
  role?: UserRole;
}

// Response จาก Login
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

// ข้อมูลสำหรับ Login Form
export interface LoginCredentials {
  identifier: string;  // email หรือ student_id
  password: string;
  remember_me?: boolean;
}

// ข้อมูลสำหรับสร้างบัญชีนักเรียน
export interface CreateStudentInput {
  student_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  grade_level: string;
  classroom?: string;
  birth_date?: string;
}
