# 🎭 Character Chat System Design
## ระบบแชตคาแรกเตอร์ AI สำหรับ KooJai
**Neon Project**: `koojai-neon-mcp` (ID: `frosty-morning-32774801`)

---

## 📌 Overview (ภาพรวม)

### 🔴 สิ่งสำคัญ: แยก 2 โหมดการทำงานอย่างชัดเจน

| โหมด | ชื่อ | คุณสมบัติ | การส่งสรุป |
|------|------|----------|-----------|
| **🎤 Live Mode** | โหมดเสียง (เดิม) | คุยด้วยเสียงแบบ Real-time | **ส่งทันทีเมื่อกดหยุด** |
| **💬 Text Mode** | โหมดพิมพ์ (ใหม่) | พิมพ์ข้อความกับ AI | **ส่งเมื่อตรวจพบความเสี่ยงเท่านั้น** |

### 📍 ความแตกต่างระหว่างสองโหมด

#### 🎤 Live Mode (โหมดเสียง - ห้ามเปลี่ยน!)
```
✅ UX/UI เดิมทั้งหมด (Visualizer, Transcript bubble)
✅ ข้อความมาทีละคำ → รวมเป็น bubble เดียวตาม role
✅ กดปุ่มหยุด → วิเคราะห์ + ส่งสรุปให้ครูทันที
✅ แสดง Healing Card หลังวิเคราะห์
```

#### 💬 Text Mode (โหมดพิมพ์ - ใหม่)
```
✅ พิมพ์ข้อความ คล้าย ChatGPT
✅ เก็บประวัติใน IndexedDB 
✅ ส่งสรุปให้ครูเฉพาะเมื่อตรวจพบความเสี่ยง (Risk Detection)
✅ ไม่มี Healing Card ทุกครั้ง (เพื่อลด API load)
```

### 🎯 เป้าหมายหลัก
- ทำให้ระบบดู **สนุก ไม่เหมือนระบบของโรงเรียน**
- รักษา **ความเป็นส่วนตัว** ของนักเรียน (ไม่ส่งประวัติแชตให้ครู)
- ครูได้รับ **สรุปสั้นๆ** เพื่อดูแลเด็กได้ โดยไม่ละเมิดความเป็นส่วนตัว
- นักเรียนสามารถ **ดูประวัติการสนทนา** และ **สนทนาต่อ** ได้
- **รักษา UX/UI เดิมของ Live Mode ไว้ทั้งหมด** (ห้ามเปลี่ยนแปลง)

---

## 🏗️ System Architecture (สถาปัตยกรรมระบบ)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          KooJai System                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      📱 LIVE MODE (เดิม)                          │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │    │
│  │  │  Chat Page  │───▶│  Visualizer │───▶│  Gemini Live API    │  │    │
│  │  │ (Voice Only)│    │   + Bubbles │    │  (Real-time Audio)  │  │    │
│  │  └─────────────┘    └─────────────┘    └─────────────────────┘  │    │
│  │         │                                        │                │    │
│  │         ▼                                        ▼                │    │
│  │  กดหยุด → วิเคราะห์ + ส่งสรุปให้ครูทันที → แสดง Healing Card     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      💬 TEXT MODE (ใหม่)                          │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │    │
│  │  │  Character  │───▶│    Chat     │───▶│   Gemini Text API   │  │    │
│  │  │   Creator   │    │   Screen    │    │  (generateContent)  │  │    │
│  │  └─────────────┘    └─────────────┘    └─────────────────────┘  │    │
│  │         │                  │                       │              │    │
│  │         ▼                  ▼                       ▼              │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │              IndexedDB (Local Storage)                      │  │    │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐              │  │    │
│  │  │  │Characters │  │   Chats   │  │ Messages  │              │  │    │
│  │  │  └───────────┘  └───────────┘  └───────────┘              │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  │                              │                                    │    │
│  │                              ▼ (เฉพาะเมื่อตรวจพบความเสี่ยง)        │    │
│  │                    ส่งสรุปให้ครูผ่าน API                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   Backend Server (PostgreSQL/Neon)               │    │
│  │                   → ตาราง reports เก็บสรุปการสนทนา                  │    │
│  │                   → ตาราง students, teachers, sessions           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (PostgreSQL/Neon)

### ตารางที่มีอยู่ในระบบ

#### 1. `reports` - รายงานสรุปการสนทนา
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  severity_level TEXT NOT NULL,          -- 'NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  problem_category TEXT[],               -- หมวดหมู่ปัญหา
  summary_for_teacher TEXT,              -- สรุปสั้นๆ ให้ครูอ่าน
  recommendation_for_teacher TEXT,       -- คำแนะนำว่าครูควรทำยังไง
  should_notify_teacher BOOLEAN DEFAULT false,
  memory_for_next_session TEXT,          -- สิ่งที่ AI ควรจำไว้ทักทายครั้งหน้า
  healing_quote TEXT,                    -- คำคมฮีลใจสำหรับนักเรียน
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `students` - ข้อมูลนักเรียน
#### 3. `teachers` - ข้อมูลครู
#### 4. `sessions` - เซสชันการเข้าสู่ระบบ
#### 5. `moods` - บันทึกอารมณ์รายวัน

---

## 📊 Data Models (โครงสร้างข้อมูล)

### 1. TeacherReport (สำหรับ Live Mode - ส่งไปยัง Server)
```typescript
// ใช้ทั้ง Live Mode และ Text Mode (เมื่อมีความเสี่ยง)
interface TeacherReport {
  student_id: string;
  severity_level: SeverityLevel;          // NONE, LOW, MEDIUM, HIGH, CRITICAL
  problem_category: string[];             // หมวดหมู่ปัญหา เช่น ['การเรียน', 'เพื่อน']
  summary_for_teacher: string;            // สรุปสั้นๆ ให้ครูอ่าน
  recommendation_for_teacher: string;     // คำแนะนำว่าครูควรทำไง
  should_notify_teacher: boolean;         // แจ้งเตือนครูไหม?
  memory_for_next_session: string;        // สิ่งที่ AI ควรจำไว้ทักทายครั้งหน้า
  healing_quote: string;                  // คำคมฮีลใจสำหรับนักเรียน
}
```

### 2. Character (คาแรกเตอร์ - IndexedDB)
```typescript
interface Character {
  id: string;                    // UUID
  studentId: string;             // รหัสนักเรียนเจ้าของ
  name: string;                  // ชื่อคาแรกเตอร์ เช่น "พี่กระต่าย", "น้องหมี"
  avatar: string;                // รูปโปรไฟล์ (emoji หรือ URL)
  personality: string;           // บุคลิก เช่น "ร่าเริง", "ใจดี", "เท่ห์"
  description: string;           // คำอธิบายตัวละคร
  voiceGender: 'male' | 'female'; // เพศของเสียง
  voiceName: string;             // ชื่อเสียง Gemini เช่น "Aoede", "Charon"
  systemPrompt: string;          // Prompt สำหรับ AI (สร้างอัตโนมัติ)
  createdAt: number;
  updatedAt: number;
}
```

### 3. Chat (ห้องแชต/เซสชัน - IndexedDB)
```typescript
interface Chat {
  id: string;                    // UUID
  characterId: string;           // คาแรกเตอร์ที่คุยด้วย
  studentId: string;             // รหัสนักเรียน
  title: string;                 // หัวข้อ (สร้างอัตโนมัติจากข้อความแรก)
  mode: 'text' | 'voice';        // โหมดการสนทนา
  lastMessageAt: number;         // ข้อความล่าสุดเมื่อไหร่
  isSummarized: boolean;         // สรุปไปให้ครูแล้วหรือยัง
  createdAt: number;
}
```

### 4. LocalMessage (ข้อความ - IndexedDB)
```typescript
interface LocalMessage {
  id: string;                    // UUID
  chatId: string;                // อยู่ในห้องแชตไหน
  role: 'user' | 'assistant';    // ใครพูด
  content: string;               // เนื้อหา (Text)
  contentType: 'text' | 'voice'; // ประเภท (ถ้าเป็น voice จะเก็บ transcript)
  timestamp: number;
}
```

### 5. ChatMessage (สำหรับ Live Mode - ใช้ระหว่างสนทนา)
```typescript
// ⚠️ ใช้เฉพาะ Live Mode - รวมข้อความทีละคำเป็นประโยค
interface ChatMessage {
  role: 'user' | 'model';        // ใครพูด? (คน หรือ AI)
  text: string;                  // เนื้อหา (สะสมมาจากทีละคำ)
  timestamp: number;             // เวลาที่พูด
}
```

---

## 🎨 User Flow (ลำดับการใช้งาน)

### Flow 1: 🎤 Live Mode (โหมดเสียง - เดิม ห้ามเปลี่ยน!)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐
│  หน้า Login │────▶│  หน้า Chat  │────▶│  กดปุ่มไมค์ → เริ่มคุยด้วยเสียง │
│             │     │  (KooJai)   │     │  (Gemini Live API)           │
└─────────────┘     └─────────────┘     └─────────────────────────────┘
                                                        │
                           ┌────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  📍 ระหว่างคุย (Real-time)                                             │
│  ─────────────────────────────────────────                            │
│  • Transcript มาทีละคำ → รวมเป็น bubble ตาม role                       │
│  • ถ้า role เดียวกัน → ต่อท้าย text เดิม                               │
│  • ถ้า role ต่างกัน → สร้าง bubble ใหม่                                │
│  • แสดง bubble ล่าสุดอันเดียว (เลื่อนอัตโนมัติ)                         │
│  • Visualizer แสดง volume จากเสียง                                    │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  📍 กดปุ่มหยุด                                                         │
│  ─────────────────────────────────────────                            │
│  1. หยุด Live Session                                                 │
│  2. วิเคราะห์บทสนทนาด้วย analyzeConversationSimple()                   │
│  3. ส่งรายงานไป POST /api/reports (ทุกครั้ง)                           │
│  4. แสดง Healing Card                                                 │
│  5. ล้าง transcript                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### ⚠️ สิ่งที่ห้ามเปลี่ยนใน Live Mode

| รายการ | รายละเอียด |
|--------|-----------|
| Transcript Logic | `lastMsg.role === role → ต่อท้าย text` |
| Bubble Display | แสดง bubble ล่าสุดอันเดียว |
| End Session | ส่งสรุปทุกครั้งเมื่อกดหยุด |
| Healing Card | แสดงหลังวิเคราะห์เสร็จ |
| Visualizer | แสดง volume ตาม speakerSource |

### Flow 2: 💬 Text Mode (โหมดพิมพ์ - ใหม่)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  เลือกคาแรก  │────▶│  หน้าแชต    │────▶│  พิมพ์ข้อความ │────▶│  AI ตอบกลับ  │
│   เตอร์      │     │  (Text)     │     │  ส่ง        │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                           ┌────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  📍 การตรวจจับความเสี่ยง (Risk Detection)                              │
│  ─────────────────────────────────────────                            │
│  • ทุกข้อความที่ AI ตอบ จะตรวจสอบ [RISK_FLAG] tag                      │
│  • ถ้าพบความเสี่ยง HIGH/CRITICAL → ส่งสรุปให้ครูทันที                   │
│  • ถ้าไม่พบความเสี่ยง → ไม่ส่งสรุป (เก็บใน IndexedDB อย่างเดียว)        │
└──────────────────────────────────────────────────────────────────────┘
```

### Flow 3: สร้างคาแรกเตอร์ใหม่

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   หน้าหลัก   │────▶│  เลือกธีม/   │────▶│  ตั้งชื่อ/    │────▶│  เลือกเสียง  │
│  "สร้างใหม่"  │     │   บุคลิก     │     │   avatar    │     │  (ถ้าต้องการ) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   เริ่มแชต!  │
                                                            └─────────────┘
```

---

## 🔄 Summary Strategy (กลยุทธ์การส่งสรุป)

### 🎤 Live Mode: ส่งสรุปทุกครั้งเมื่อกดหยุด (เหมือนเดิม)

```typescript
// ใน ChatPage.tsx - ห้ามเปลี่ยน!
const endSession = async () => {
  setIsLive(false);
  setVolume(0);
  const currentTranscript = [...transcript];

  if (geminiServiceRef.current) {
    await geminiServiceRef.current.stopLiveSession();
    performAnalysis(currentTranscript);  // ← วิเคราะห์ + ส่งสรุปทันที
  }
};

const performAnalysis = async (chatTranscript: ChatMessage[]) => {
  // ... วิเคราะห์
  const result = await geminiServiceRef.current.analyzeConversationSimple(user.student_id, log);
  setReport(result);
  
  // ส่งไป API ทุกครั้ง
  await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  
  setShowHealingCard(true);  // แสดง Healing Card
};
```

### 💬 Text Mode: ส่งสรุปเฉพาะเมื่อตรวจพบความเสี่ยง

เพื่อไม่ให้การทำงานหนักเกินไป Text Mode จะใช้ **Risk Detection เท่านั้น**

```typescript
// ใน Text Chat Component (ใหม่)
const checkForRisk = async (aiResponse: string, conversationLog: string) => {
  // วิธีที่ 1: ตรวจจับ RISK_FLAG จาก AI response
  const riskMatch = aiResponse.match(/\[RISK_FLAG:\s*{([^}]+)}\]/);
  if (riskMatch) {
    const riskData = JSON.parse(`{${riskMatch[1]}}`);
    if (riskData.level === 'HIGH' || riskData.level === 'CRITICAL') {
      await sendSummaryToTeacher(conversationLog);
    }
  }
  
  // วิธีที่ 2: ใช้ AI วิเคราะห์แบบเบา (ถ้าต้องการ)
  // แต่ไม่แนะนำ เพราะจะทำให้หนักเกินไป
};

// ส่งสรุปเฉพาะเมื่อมีความเสี่ยง
const sendSummaryToTeacher = async (conversationLog: string) => {
  const report = await geminiService.analyzeConversation(studentId, conversationLog);
  
  // ส่งไป API เฉพาะเมื่อมีความเสี่ยง
  if (report.riskLevel === 'HIGH' || report.riskLevel === 'CRITICAL') {
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        severity_level: report.riskLevel,
        problem_category: report.topics,
        summary_for_teacher: report.summary,
        recommendation_for_teacher: report.flaggedConcerns.join(', '),
        should_notify_teacher: true,
        memory_for_next_session: report.memory_for_next_session,
        healing_quote: report.healing_quote,
      }),
    });
  }
};
```

### 📊 เปรียบเทียบการส่งสรุป

| โหมด | เมื่อไหร่ส่งสรุป | ความถี่ | API Load |
|------|----------------|--------|----------|
| 🎤 Live Mode | ทุกครั้งที่กดหยุด | ทุกเซสชัน | ปานกลาง |
| 💬 Text Mode | เฉพาะเมื่อตรวจพบ HIGH/CRITICAL | เฉพาะเมื่อเสี่ยง | ต่ำมาก |---

## 🚨 Risk Detection System (ระบบตรวจจับความเสี่ยง)

### สำหรับ Text Mode - ใช้ System Prompt เพิ่มเติม

```typescript
const RISK_DETECTION_PROMPT = `
หากผู้ใช้พูดถึงเรื่องที่น่าเป็นห่วง เช่น:
- ทำร้ายตัวเอง
- ถูกกลั่นแกล้ง
- ปัญหาครอบครัวร้ายแรง
- คิดไม่อยากมีชีวิต
- ถูกทำร้ายร่างกายหรือจิตใจ

ให้เพิ่ม JSON tag ท้ายข้อความ (หลังจากตอบปกติแล้ว):
[RISK_FLAG: { "level": "HIGH", "concern": "อธิบายสั้นๆ" }]

ระดับความเสี่ยง:
- LOW: ปัญหาทั่วไป ไม่น่าเป็นห่วง
- MEDIUM: ควรติดตาม แต่ไม่เร่งด่วน  
- HIGH: ควรแจ้งครูให้รู้
- CRITICAL: เร่งด่วน ต้องแจ้งทันที
`;
```

### ตัวอย่าง AI Response ที่มี Risk Flag

```
AI: เราเข้าใจนะ ช่วงนี้มันหนักมากสำหรับเธอ ถ้าอยากระบายอะไรเพิ่มเติม เราอยู่ตรงนี้เสมอ
[RISK_FLAG: { "level": "HIGH", "concern": "นักเรียนพูดถึงความรู้สึกอยากหายไป" }]
```

### Frontend Detection

```typescript
const checkForRisk = (aiResponse: string): { level: string; concern: string } | null => {
  const riskMatch = aiResponse.match(/\[RISK_FLAG:\s*({[^}]+})\]/);
  if (riskMatch) {
    try {
      return JSON.parse(riskMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
};

// ลบ RISK_FLAG ออกก่อนแสดงผล
const cleanResponse = (response: string): string => {
  return response.replace(/\[RISK_FLAG:[^\]]+\]/g, '').trim();
};
```

---

## 🎤 Live Mode Transcript Logic (สำคัญมาก!)

### ปัญหาที่ต้องระวัง
ใน Live Mode ข้อความจะส่งมา **ทีละคำ** ไม่ใช่ทั้งประโยค
ถ้าไม่จัดการดี จะได้ bubble แยกทุกคำ แบบนี้:

```
❌ แบบผิด:
[User bubble] "สวัสดี"
[User bubble] "วันนี้"
[User bubble] "เป็น"
[User bubble] "ยังไง"
[User bubble] "บ้าง"
```

### วิธีแก้ (ที่ใช้อยู่ - ห้ามเปลี่ยน!)

```typescript
// ใน ChatPage.tsx - Logic ที่ถูกต้อง
geminiServiceRef.current = new GeminiService(
  (text, isUser) => {
    if (!text) return;
    setSpeakerSource(isUser ? 'user' : 'ai');
    setTranscript(prev => {
      const lastMsg = prev[prev.length - 1];
      const role = isUser ? 'user' : 'model';
      
      // ✅ ถ้า role เดียวกัน → ต่อท้าย text เดิม (รวมเป็น bubble เดียว)
      if (lastMsg && lastMsg.role === role) {
        const newTranscript = [...prev];
        newTranscript[newTranscript.length - 1].text += text;
        return newTranscript;
      } else {
        // ✅ ถ้า role ต่างกัน → สร้าง bubble ใหม่
        return [...prev, { role, text, timestamp: Date.now() }];
      }
    });
  },
  // ... volume callback
);
```

### ผลลัพธ์ที่ถูกต้อง

```
✅ แบบถูก:
[User bubble] "สวัสดีวันนี้เป็นยังไงบ้าง"
[AI bubble] "สวัสดีค่ะ วันนี้อากาศดีนะคะ มีอะไรอยากเล่าให้ฟังมั้ย"
[User bubble] "วันนี้เหนื่อยมากเลย"
```

### การแสดงผล Transcript (Live Mode)

```tsx
// แสดงเฉพาะ bubble ล่าสุด
{transcript.length > 0 && isLive ? (
  <div className="w-full py-2">
    <span className={`inline-block px-6 py-4 rounded-3xl ...
      ${transcript[transcript.length - 1].role === 'user' 
        ? 'bg-blue-600 text-white' 
        : 'bg-white text-slate-700'}`}>
      {transcript[transcript.length - 1].text}
    </span>
  </div>
) : null}
```

---

## 🗄️ IndexedDB Schema (สำหรับ Text Mode)

```typescript
// src/utils/indexedDb.ts (ที่มีอยู่แล้ว)
const DB_NAME = 'KooJaiCharacterChatDB';
const DB_VERSION = 2;

const STORES = {
  CHARACTERS: 'characters',   // เก็บคาแรกเตอร์ที่สร้าง
  CHATS: 'chats',             // เก็บเซสชันการสนทนา
  MESSAGES: 'messages',       // เก็บข้อความ
  SUMMARIES: 'summaries',     // เก็บสรุป (Local cache)
};

// Index ที่ใช้
// characters: 'id', index on 'studentId'
// chats: 'id', index on 'studentId', 'characterId'
// messages: 'id', index on 'chatId'
// summaries: 'id', index on 'chatId', 'studentId'
```

---

## 🎤 Voice Options (ตัวเลือกเสียง Gemini)

Gemini Live API รองรับเสียงหลายแบบ:

### 👩 เสียงผู้หญิง (Female Voices)
| ชื่อเสียง | ลักษณะ | เหมาะกับ |
|----------|--------|---------|
| **Aoede** | อ่อนโยน นุ่มนวล | คาแรกเตอร์ใจดี พี่สาว |
| **Kore** | สดใส ร่าเริง | คาแรกเตอร์น้องสาว เด็ก |
| **Leda** | มั่นคง น่าเชื่อถือ | คาแรกเตอร์ครู ที่ปรึกษา |

### 👨 เสียงผู้ชาย (Male Voices)
| ชื่อเสียง | ลักษณะ | เหมาะกับ |
|----------|--------|---------|
| **Charon** | ทุ้ม นิ่ง | คาแรกเตอร์พี่ชาย นักปรัชญา |
| **Fenrir** | เท่ห์ ลึกลับ | คาแรกเตอร์ผจญภัย |
| **Orus** | อบอุ่น เป็นมิตร | คาแรกเตอร์เพื่อน |

### 🇹🇭 การตั้งค่าภาษาไทย
```typescript
const voiceConfig = {
  languageCode: 'th-TH',
  voiceName: selectedVoice, // เช่น 'Aoede'
};
```

---

## 📱 UI Components (ส่วนประกอบหน้าจอ)

### หน้าจอที่ต้องสร้าง

```
## 📱 UI Components (ส่วนประกอบหน้าจอ - สำหรับ Text Mode)

### โครงสร้างที่เพิ่มใหม่ (สำหรับ Text Mode)

```
src/app/
├── chat/
│   └── page.tsx               # ✅ หน้า Live Mode (ห้ามเปลี่ยน!)
├── characters/                 # 🆕 หน้าคาแรกเตอร์ (Text Mode)
│   ├── page.tsx               # หน้ารวมคาแรกเตอร์
│   ├── create/
│   │   └── page.tsx           # หน้าสร้างคาแรกเตอร์
│   └── [id]/
│       └── chat/
│           └── page.tsx       # หน้าแชตกับคาแรกเตอร์ (Text)

src/components/
├── CharacterCreator.tsx       # ✅ มีอยู่แล้ว
├── ProtectedRoute.tsx         # ✅ มีอยู่แล้ว
├── Visualizer.tsx             # ✅ มีอยู่แล้ว (สำหรับ Live Mode)
└── character/                  # 🆕 Components สำหรับ Text Mode
    ├── CharacterCard.tsx
    ├── TextChatBubble.tsx
    └── TextChatInput.tsx
```

---

## 🔐 Privacy & Security (ความเป็นส่วนตัว)

### สิ่งที่เก็บในเครื่องนักเรียน (IndexedDB)
✅ ประวัติแชตเต็ม (Messages) - Text Mode
✅ คาแรกเตอร์ที่สร้าง
✅ ข้อมูลการตั้งค่าส่วนตัว

### สิ่งที่ส่งไปให้ครู (Server - PostgreSQL/Neon)

#### 🎤 Live Mode
ส่งทุกครั้งเมื่อกดหยุด:
- ✅ severity_level
- ✅ problem_category
- ✅ summary_for_teacher
- ✅ recommendation_for_teacher
- ✅ should_notify_teacher
- ✅ memory_for_next_session
- ✅ healing_quote

#### 💬 Text Mode
ส่งเฉพาะเมื่อตรวจพบความเสี่ยง HIGH/CRITICAL:
- ✅ severity_level (HIGH หรือ CRITICAL เท่านั้น)
- ✅ summary_for_teacher
- ✅ should_notify_teacher = true

❌ **ไม่ส่ง:** ข้อความเต็ม, รายละเอียดการสนทนา

---

## 🚀 Implementation Status (สถานะการพัฒนา)

### ✅ เสร็จแล้ว
- [x] Live Mode (โหมดเสียง) - เหมือน Vite เดิมทุกประการ
- [x] Transcript Logic (รวมข้อความทีละคำเป็น bubble)
- [x] วิเคราะห์ + ส่งสรุปเมื่อกดหยุด
- [x] Healing Card
- [x] Teacher Report View
- [x] IndexedDB Schema สำหรับ Characters, Chats, Messages
- [x] API /api/reports (POST)
- [x] API /api/memory/[studentId] (GET)
- [x] CharacterCreator Component

### 📝 รอดำเนินการ (Text Mode)
- [ ] หน้ารวมคาแรกเตอร์ (Character List)
- [ ] หน้าสร้างคาแรกเตอร์ (Character Create)
- [ ] หน้าแชตแบบพิมพ์ (Text Chat)
- [ ] Risk Detection System
- [ ] ส่งสรุปเฉพาะเมื่อเสี่ยง

---

## 📝 Example System Prompts

### คาแรกเตอร์ "KooJai" (Default - Live Mode)
```
คุณคือ "KooJai" (คู่ใจ) เพื่อนพี่กระต่ายที่อบอุ่นและใจดี
บุคลิก: ใจดี อบอุ่น รับฟังเก่ง ไม่ตัดสิน
ภาษา: พูดไทยเป็นกันเอง ใช้คำว่า "เธอ", "หนู", "เรา"
หน้าที่: รับฟังปัญหา ให้กำลังใจ ไม่สั่งสอนมากเกินไป
```

### คาแรกเตอร์ Custom (Text Mode)
```
คุณคือ "{{NAME}}" ({{PERSONALITY}}) {{DESCRIPTION}}
บุคลิก: แสดงออกตามบุคลิก {{PERSONALITY}}
ภาษา: พูดไทยเป็นกันเอง
หน้าที่: รับฟังปัญหา ให้กำลังใจ ไม่สั่งสอนมากเกินไป
```

---

## ⚠️ IMPORTANT: สิ่งที่ห้ามเปลี่ยนใน Live Mode

### ❌ ห้ามเปลี่ยนโค้ดเหล่านี้

#### 1. Transcript Accumulation Logic
```typescript
// ใน ChatPage.tsx - ห้ามเปลี่ยน!
setTranscript(prev => {
  const lastMsg = prev[prev.length - 1];
  const role = isUser ? 'user' : 'model';
  if (lastMsg && lastMsg.role === role) {
    // ต่อท้าย text เดิม
    const newTranscript = [...prev];
    newTranscript[newTranscript.length - 1].text += text;
    return newTranscript;
  } else {
    return [...prev, { role, text, timestamp: Date.now() }];
  }
});
```

#### 2. End Session Flow
```typescript
// ห้ามเปลี่ยน! ต้องวิเคราะห์และส่งสรุปทุกครั้ง
const endSession = async () => {
  setIsLive(false);
  await geminiServiceRef.current.stopLiveSession();
  performAnalysis(currentTranscript);  // ← ส่งสรุปทุกครั้ง
};
```

#### 3. Healing Card Display
```typescript
// ห้ามเปลี่ยน! แสดง Healing Card หลังวิเคราะห์
setShowHealingCard(true);
```

---

## ✅ Checklist ก่อน Production

### 🎤 Live Mode (ต้องทดสอบก่อน)
- [ ] Transcript รวมข้อความทีละคำเป็น bubble เดียว
- [ ] กดหยุด → วิเคราะห์ + ส่งสรุปทันที
- [ ] Healing Card แสดงหลังวิเคราะห์
- [ ] Teacher Report แสดงได้
- [ ] Visualizer แสดง volume ถูกต้อง

### 💬 Text Mode (รอพัฒนา)
- [ ] Risk Detection ทำงาน
- [ ] ส่งสรุปเฉพาะเมื่อเสี่ยง HIGH/CRITICAL
- [ ] ประวัติแชตเก็บใน IndexedDB
- [ ] สามารถสร้างคาแรกเตอร์ได้

### 🔒 Privacy & Security
- [ ] ไม่ส่งข้อความเต็มไปให้ครู
- [ ] ข้อมูลใน IndexedDB ปลอดภัย

---

## 📚 References

- [Gemini Live API Documentation](https://ai.google.dev/gemini-api/docs/live)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Neon PostgreSQL](https://neon.tech/docs)
