# 📋 แผนการพัฒนา KooJai Character Chat

> เอกสารวางแผนปรับปรุงระบบ KooJai ให้เป็น Character Chat ที่สนุก ทันสมัย และใช้งานได้จริง
> 
> **วันที่สร้าง:** 18 มกราคม 2026  
> **สถานะ:** รอการอนุมัติ

---

## 📊 สรุปการวิเคราะห์ระบบปัจจุบัน

### ✅ สิ่งที่ทำงานได้ดีแล้ว
| รายการ | สถานะ | หมายเหตุ |
|--------|-------|---------|
| Voice Mode (Live Chat) | ✅ ทำงานได้ | Gemini Live API, Real-time Audio |
| Text Mode (พิมพ์คุย) | ✅ ทำงานได้ | รองรับทั้ง KooJai และ Custom Character |
| ระบบ Authentication | ✅ ทำงานได้ | Login นักเรียน, ครู |
| IndexedDB Storage | ✅ ทำงานได้ | เก็บประวัติแชต, Characters |
| Healing Card | ✅ ทำงานได้ | แสดงหลังจบ Voice Session |
| Teacher Dashboard | ✅ ทำงานได้ | ดู Reports ได้ |

### ⚠️ ปัญหาที่พบ

#### 1. 🚨 ระบบแจ้งเตือนครูไม่ทำงานตามที่ออกแบบ
**ปัญหา:** 
- ใน Text Mode ระบบตรวจจับ Risk Flag แต่ **ไม่ได้ส่งรายงานให้ครูทันที** เมื่อพบความเสี่ยง
- โค้ดปัจจุบันใน `chat/page.tsx` มีการตรวจจับ `[RISK_FLAG]` แต่ logic การส่งไม่ครบถ้วน
- ไม่มีกลไกการส่งสรุปอัปเดตเมื่อมีข้อความเสี่ยงติดกัน

**หลักฐาน:**
```typescript
// ใน chat/page.tsx (บรรทัด 514-530)
// ตรวจจับ Risk ได้ แต่ต้องปรับปรุง logic ให้ส่งทันที
if (riskMatch) {
  try {
    const jsonStr = `{${riskMatch[1]}}`;
    const risk = JSON.parse(jsonStr);
    if (risk.level === 'HIGH' || risk.level === 'CRITICAL') {
      await sendRiskReport(risk, userMessage, cleanedResponse);
    }
  } catch (e) {
    console.warn('Failed to parse risk flag');
  }
}
```

#### 2. 🎨 หน้าแรกไม่ใช่หน้าเลือก Character
**ปัญหา:**
- หน้าแรก (`page.tsx`) เป็นแค่ redirect ไม่มี UI
- ผู้ใช้ต้องผ่านหน้า Login → redirect อัตโนมัติไป `/characters`
- ไม่รู้สึกเหมือนเป็นแอป Character Chat ที่สนุก

#### 3. 📱 UX/UI ยังไม่เป็น Character Chat เต็มรูปแบบ
**ปัญหา:**
- ยังมีกลิ่นของ "ระบบโรงเรียน" (ปุ่ม Report, Profile)
- ไม่มี Landing Page ที่ดึงดูด
- Header ยังมีปุ่มหลายอัน ทำให้รกตา

---

## 🎯 แผนการปรับปรุง

### Phase 1: ปรับปรุงระบบแจ้งเตือนความเสี่ยง (สำคัญที่สุด)
**ระยะเวลา:** 1-2 วัน

#### 1.1 ปรับ Logic การส่งรายงานความเสี่ยงใน Text Mode

**กลไกใหม่:**
```
┌─────────────────────────────────────────────────────────────────┐
│                 🚨 Risk Detection Flow (Text Mode)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ข้อความที่ 1 มี RISK_FLAG (HIGH/CRITICAL)                       │
│       │                                                          │
│       ▼                                                          │
│  📤 ส่งรายงานให้ครูทันที (First Alert)                           │
│       │                                                          │
│       ▼                                                          │
│  เก็บ riskCounter = 1                                           │
│       │                                                          │
│       ▼                                                          │
│  ข้อความถัดไป...                                                 │
│       │                                                          │
│       ├── ถ้ามี RISK → riskCounter++                             │
│       │      │                                                   │
│       │      └── ถ้า riskCounter >= 3                            │
│       │               │                                          │
│       │               ▼                                          │
│       │          📤 ส่งรายงานอัปเดต (Update Alert)               │
│       │          รีเซ็ต riskCounter = 0                          │
│       │                                                          │
│       └── ถ้าไม่มี RISK → รีเซ็ต riskCounter = 0                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**ไฟล์ที่ต้องแก้ไข:**
- `src/app/chat/page.tsx` - เพิ่ม state `riskCounter` และ logic ใหม่
- `src/app/characters/[id]/chat/page.tsx` - เพิ่ม logic เดียวกัน (ถ้ามี)

**โค้ดที่ต้องเพิ่ม:**
```typescript
// State ใหม่สำหรับ Risk Tracking
const [riskCounter, setRiskCounter] = useState(0);
const [lastRiskReportTime, setLastRiskReportTime] = useState<number | null>(null);

// Logic ใหม่ใน handleSendText
const handleRiskDetection = async (
  risk: { level: string; concern: string },
  userMessage: string,
  aiResponse: string
) => {
  const isHighRisk = risk.level === 'HIGH' || risk.level === 'CRITICAL';
  
  if (!isHighRisk) {
    // Reset counter ถ้าไม่เสี่ยง
    setRiskCounter(0);
    return;
  }

  const newCount = riskCounter + 1;
  setRiskCounter(newCount);

  // ส่งทันทีถ้าเป็นครั้งแรก หรือ ทุก 3 ข้อความเสี่ยง
  if (newCount === 1 || newCount >= 3) {
    await sendRiskReportImmediate(risk, userMessage, aiResponse);
    if (newCount >= 3) {
      setRiskCounter(0); // Reset after update
    }
  }
};
```

---

### Phase 2: ปรับ UI หน้าแรกเป็น Character Selection
**ระยะเวลา:** 1-2 วัน

#### 2.1 ออกแบบหน้าแรกใหม่

**Concept:**
- ทำให้รู้สึกเหมือนแอป Character Chat (คล้าย Character.AI)
- ไม่ให้รู้สึกว่าเป็นของโรงเรียน
- ธีมสีขาว-น้ำเงิน โมเดิร์น โค้งมน

**Wireframe:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   [โลโก้ KooJai]                              [👤 Profile]   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│      🎭 เลือกเพื่อนคุยวันนี้                                   │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │  ┌─────────┐                                        │    │
│   │  │   🐰    │  KooJai (คู่ใจ)                        │    │
│   │  └─────────┘  เพื่อนพี่กระต่ายที่อบอุ่น               │    │
│   │                                                     │    │
│   │  [💬 พิมพ์คุย]    [🎤 พูดคุย]                        │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   ─────────── คาแรกเตอร์ของฉัน ───────────                   │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │    😸    │  │    🦊    │  │   ➕    │                  │
│   │ น้องแมว   │  │ พี่จิ้งจอก │  │  สร้างใหม่ │                  │
│   └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Design Principles:**
- ✅ Shadow ใช้ `shadow-sm` หรือ `shadow-md` เท่านั้น
- ✅ มุมโค้ง `rounded-2xl` หรือ `rounded-3xl`
- ✅ ไม่มี animation วนลูป (ห้าม floating/bounce loop)
- ✅ Responsive ทั้ง Mobile และ Desktop
- ✅ Transition ใช้ `transition-all` เรียบง่าย

**ไฟล์ที่ต้องแก้ไข:**
- `src/app/page.tsx` - เปลี่ยนจาก redirect เป็นหน้า Character Selection
- `src/app/characters/page.tsx` - อาจรวมเข้ากับหน้าแรก

#### 2.2 ซ่อนความเป็น "ระบบโรงเรียน"

**สิ่งที่ต้องทำ:**
1. ย้ายปุ่ม Report ไปซ่อนใน Profile
2. ลดปุ่มใน Header ให้เหลือน้อยที่สุด
3. ไม่แสดง student_id ที่เห็นชัด

**ก่อน:**
```
[KooJai] [พิมพ์คุย] [ตัวละคร] [Report] [Profile] [Logout]
```

**หลัง:**
```
[🐰 KooJai]                          [สลับโหมด] [☰ เมนู]
```

---

### Phase 3: ปรับปรุง UX ทั่วไป
**ระยะเวลา:** 1 วัน

#### 3.1 Responsive Design
- ทดสอบและปรับ breakpoints
- Mobile-first approach
- ปรับ padding/margin สำหรับหน้าจอเล็ก

#### 3.2 ลบ Animation ที่ไม่เหมาะสม
- ลบ `animate-bounce` ที่วนลูป
- ลบ `animate-pulse` ที่ไม่จำเป็น
- เก็บเฉพาะ transition และ fade

#### 3.3 ปรับ Header ในหน้า Chat
- ลดความรกของปุ่ม
- ใช้ dropdown menu แทนปุ่มหลายอัน

---

## 📁 ไฟล์ที่ต้องแก้ไข

| ไฟล์ | การเปลี่ยนแปลง | ความสำคัญ |
|------|---------------|----------|
| `src/app/page.tsx` | เปลี่ยนเป็น Character Selection UI | 🔴 สูง |
| `src/app/chat/page.tsx` | เพิ่ม Risk Counter Logic | 🔴 สูง |
| `src/app/characters/page.tsx` | อาจรวมกับหน้าแรก หรือปรับ UI | 🟡 ปานกลาง |
| `src/app/characters/[id]/chat/page.tsx` | เพิ่ม Risk Counter Logic (ถ้ามี) | 🟡 ปานกลาง |
| `src/app/globals.css` | ลบ animation ที่ไม่ต้องการ | 🟢 ต่ำ |

---

## 🔄 Workflow การส่งรายงานความเสี่ยง (ใหม่)

### Text Mode - แผนภาพรายละเอียด

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     📱 Text Mode - Risk Detection                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [นักเรียนพิมพ์ข้อความ]                                                   │
│         │                                                                │
│         ▼                                                                │
│  [AI ตอบกลับ + ตรวจสอบ RISK_FLAG]                                        │
│         │                                                                │
│         ├── ไม่มี RISK_FLAG ──────────────────▶ [ไม่ทำอะไร]               │
│         │                                                                │
│         └── มี RISK_FLAG ─────────▶ ตรวจสอบ level                        │
│                                           │                              │
│                  ┌────────────────────────┴────────────────────┐        │
│                  │                                              │        │
│            LOW/MEDIUM                                    HIGH/CRITICAL   │
│                  │                                              │        │
│                  ▼                                              ▼        │
│           [บันทึก log]                              [ส่งรายงานทันที!]     │
│           [ไม่แจ้งครู]                                     │            │
│                                                            ▼            │
│                                              ┌──────────────────────┐   │
│                                              │ POST /api/reports    │   │
│                                              │ - severity_level     │   │
│                                              │ - summary_for_teacher│   │
│                                              │ - should_notify = true│  │
│                                              └──────────────────────┘   │
│                                                            │            │
│                                                            ▼            │
│                                              [เก็บ riskCounter = 1]     │
│                                                            │            │
│                                                            ▼            │
│                                              [รอข้อความถัดไป...]        │
│                                                            │            │
│                     ┌──────────────────────────────────────┤            │
│                     │                                      │            │
│              ไม่มี RISK                              มี RISK             │
│                     │                                      │            │
│                     ▼                                      ▼            │
│           [รีเซ็ต counter = 0]              [counter++ → ถ้า ≥ 3]       │
│                                                            │            │
│                                                            ▼            │
│                                              [ส่งรายงานอัปเดต!]          │
│                                              [รีเซ็ต counter = 0]       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Voice Mode - ไม่เปลี่ยนแปลง
- ยังคงส่งรายงานทุกครั้งเมื่อกดหยุด
- แสดง Healing Card เหมือนเดิม

---

## 🎨 Design System

### สีหลัก
```css
/* Primary */
--color-primary: #3B82F6;      /* blue-500 */
--color-primary-dark: #2563EB; /* blue-600 */
--color-primary-light: #EFF6FF;/* blue-50 */

/* Background */
--color-bg: #FFFFFF;
--color-bg-secondary: #F8FAFC; /* slate-50 */

/* Text */
--color-text: #1E293B;         /* slate-800 */
--color-text-secondary: #64748B;/* slate-500 */
```

### Shadow
```css
/* ใช้เฉพาะ */
.shadow-sm  /* สำหรับ card ทั่วไป */
.shadow-md  /* สำหรับ card ที่ต้องเด่น */

/* ห้ามใช้ */
.shadow-lg, .shadow-xl, .shadow-2xl
```

### Border Radius
```css
/* ใช้ */
.rounded-xl   /* 12px */
.rounded-2xl  /* 16px */
.rounded-3xl  /* 24px */
.rounded-full /* สำหรับ avatar, button */
```

### Animation
```css
/* ✅ อนุญาต */
transition-all duration-200
animate-fade-in     /* fade in ครั้งเดียว */
animate-slide-up    /* slide up ครั้งเดียว */

/* ❌ ห้าม */
animate-bounce      /* วนลูป */
animate-pulse       /* วนลูป - ยกเว้น loading */
animate-float       /* วนลูป */
```

---

## ✅ Checklist การ Implement

### Phase 1: Risk Detection (สำคัญ)
- [ ] เพิ่ม `riskCounter` state ใน `chat/page.tsx`
- [ ] สร้างฟังก์ชัน `handleRiskDetection()` 
- [ ] ทดสอบการส่งรายงานครั้งแรกเมื่อพบ Risk
- [ ] ทดสอบการส่งรายงานอัปเดตเมื่อ Risk ติดกัน 3 ข้อความ
- [ ] ทดสอบการรีเซ็ต counter เมื่อไม่มี Risk

### Phase 2: UI หน้าแรก
- [ ] ออกแบบ UI ใหม่สำหรับ `page.tsx`
- [ ] ย้าย Character Selection มารวม
- [ ] ซ่อนปุ่มที่ไม่จำเป็น
- [ ] ทดสอบ Responsive (Mobile/Tablet/Desktop)

### Phase 3: Polish
- [ ] ลบ animation วนลูป
- [ ] ปรับ shadow ให้เหมาะสม
- [ ] ทดสอบ Flow ทั้งหมด

---

## 🚀 Timeline โดยประมาณ

| วัน | งาน | รายละเอียด |
|-----|-----|-----------|
| 1 | Phase 1.1 | ปรับ Risk Detection Logic |
| 2 | Phase 1.2 + Test | ทดสอบและ fix bugs |
| 3 | Phase 2.1 | สร้าง UI หน้าแรกใหม่ |
| 4 | Phase 2.2 | ปรับ Header และซ่อนปุ่ม |
| 5 | Phase 3 | Polish + Final Testing |

---

## 📝 หมายเหตุ

1. **ห้ามแก้ไข Voice Mode Logic** - ทำงานได้ดีอยู่แล้ว
2. **เก็บ IndexedDB Schema เดิม** - ไม่ต้องเปลี่ยน
3. **ทดสอบทั้ง Mobile และ Desktop** - ก่อน deploy

---

## 🔗 เอกสารที่เกี่ยวข้อง

- [CHARACTER_CHAT_DESIGN.md](./CHARACTER_CHAT_DESIGN.md) - ออกแบบระบบเดิม
- API Routes: `/api/reports`, `/api/memory/[studentId]`

---

> **ผู้จัดทำ:** AI Assistant  
> **รอการอนุมัติจาก:** ผู้พัฒนา
