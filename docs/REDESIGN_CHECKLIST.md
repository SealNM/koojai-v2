# 🎨 KooJai Redesign Checklist

> เช็คลิสต์สำหรับการรีดีไซน์ UI ใหม่ทั้งหมด

---

## 📋 สรุปหน้าฝั่งผู้ใช้ (Student)

| # | หน้า | ไฟล์ | คำอธิบาย | สถานะ |
|---|------|------|----------|-------|
| 1 | 🔐 Login | `src/app/login/page.tsx` | หน้าเข้าสู่ระบบนักเรียน | ✅ |
| 2 | 🏠 Home | `src/app/page.tsx` | หน้าแรก แสดงคาแรกเตอร์และเมนูหลัก | ✅ |
| 3 | 😊 Mood Check-in | `src/app/mood/page.tsx` | หน้าบันทึกอารมณ์ประจำวัน | ✅ |
| 4 | 🎭 Characters List | `src/app/characters/page.tsx` | หน้ารายการคาแรกเตอร์ทั้งหมด | ✅ |
| 5 | ✨ Create Character | `src/app/characters/create/page.tsx` | หน้าสร้างคาแรกเตอร์ใหม่ | ✅ |
| 6 | 💬 Chat with Character | `src/app/characters/[id]/chat/page.tsx` | หน้าแชทกับคาแรกเตอร์ (Text + Voice) | ✅ |
| 7 | 📝 Chat History | `src/app/chat/page.tsx` | หน้าประวัติการแชท | ✅ |
| 8 | 👤 Profile | `src/app/profile/page.tsx` | หน้าโปรไฟล์และตั้งค่า | ✅ |

---

## 📁 รายละเอียดแต่ละหน้า

### 1. 🔐 Login Page
**ไฟล์:** `src/app/login/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] ฟอร์มเข้าสู่ระบบ (username, password)
- [ ] ปุ่ม Login
- [ ] แสดง error message
- [ ] Redirect ไป home เมื่อสำเร็จ

**การเชื่อมต่อ:**
- API: `POST /api/auth/login`
- Context: `useAuth()` จาก `AuthContext`

---

### 2. 🏠 Home Page
**ไฟล์:** `src/app/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] แสดงชื่อผู้ใช้
- [ ] แสดงรายการคาแรกเตอร์ (ดึงจาก API)
- [ ] ปุ่มสร้างคาแรกเตอร์ใหม่
- [ ] เมนู Quick Actions (Mood, Chat History, Profile)
- [ ] Navigation ไปหน้าอื่นๆ

**การเชื่อมต่อ:**
- API: `fetchCharacters()` จาก `characterService`
- Context: `useAuth()` จาก `AuthContext`

---

### 3. 😊 Mood Check-in Page
**ไฟล์:** `src/app/mood/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] เลือกอารมณ์ (Happy, Okay, Sad, etc.)
- [ ] เขียนบันทึก (optional)
- [ ] ปุ่มบันทึกอารมณ์
- [ ] แสดงประวัติอารมณ์ย้อนหลัง

**การเชื่อมต่อ:**
- API: `GET /api/mood` - ดึงประวัติ
- API: `POST /api/mood/save` - บันทึกอารมณ์

---

### 4. 🎭 Characters List Page
**ไฟล์:** `src/app/characters/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] แสดงรายการคาแรกเตอร์ทั้งหมด
- [ ] ปุ่มสร้างคาแรกเตอร์ใหม่
- [ ] ปุ่มแชทกับคาแรกเตอร์
- [ ] ปุ่มแก้ไข/ลบคาแรกเตอร์

**การเชื่อมต่อ:**
- API: `fetchCharacters()` - ดึงรายการ
- API: `deleteCharacter(id)` - ลบ

---

### 5. ✨ Create Character Page
**ไฟล์:** `src/app/characters/create/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] เลือก Avatar (emoji หรือ upload)
- [ ] กรอกชื่อคาแรกเตอร์
- [ ] เลือกบุคลิก (Personality)
- [ ] กรอกคำอธิบาย
- [ ] เลือกเสียง (Gender, Voice Name)
- [ ] ปุ่มสร้าง

**การเชื่อมต่อ:**
- API: `createCharacter()` - สร้างใหม่

---

### 6. 💬 Chat with Character Page
**ไฟล์:** `src/app/characters/[id]/chat/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] โหลดข้อมูลคาแรกเตอร์ (จาก API)
- [ ] สลับโหมด Text / Voice
- [ ] **Text Mode:**
  - [ ] แสดง chat bubbles
  - [ ] กรอกข้อความ
  - [ ] ปุ่มส่ง
- [ ] **Voice Mode:**
  - [ ] ปุ่มเริ่ม/หยุดสนทนา
  - [ ] แสดง visualizer
  - [ ] แสดง transcript

**การเชื่อมต่อ:**
- API: `fetchCharacter(id)` - ดึงข้อมูลคาแรกเตอร์
- IndexedDB: `createChat()`, `getChatMessages()`, `saveLocalMessage()` - ประวัติแชท
- Service: `GeminiService` - AI

---

### 7. 📝 Chat History Page
**ไฟล์:** `src/app/chat/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] แสดงรายการแชททั้งหมด
- [ ] แสดงคาแรกเตอร์ที่เคยคุย
- [ ] เลือกดูประวัติแชทเก่า

**การเชื่อมต่อ:**
- IndexedDB: `getChatsByStudent()` - ดึงประวัติแชท
- API: `fetchCharacters()` - ดึงข้อมูลคาแรกเตอร์

---

### 8. 👤 Profile Page
**ไฟล์:** `src/app/profile/page.tsx`

**ฟังก์ชันหลัก:**
- [ ] แสดงข้อมูลผู้ใช้
- [ ] แก้ไขโปรไฟล์
- [ ] เปลี่ยนรหัสผ่าน
- [ ] ปุ่ม Logout

**การเชื่อมต่อ:**
- API: `GET /api/profile` - ดึงข้อมูล
- API: `PUT /api/profile` - อัพเดท
- API: `PUT /api/profile/password` - เปลี่ยนรหัส
- API: `POST /api/auth/logout` - ออกจากระบบ

---

## 🧩 Components ที่ใช้ร่วมกัน

| Component | ไฟล์ | ใช้ในหน้า |
|-----------|------|-----------|
| Navbar | `src/components/Navbar.tsx` | ทุกหน้า |
| ProtectedRoute | `src/components/ProtectedRoute.tsx` | ทุกหน้า (ยกเว้น Login) |
| PublicRoute | `src/components/PublicRoute.tsx` | Login |
| Visualizer | `src/components/Visualizer.tsx` | Chat (Voice Mode) |
| CharacterCreator | `src/components/CharacterCreator.tsx` | Create Character |

---

## 🎨 UI Components (Design System)

| Component | ไฟล์ | คำอธิบาย |
|-----------|------|----------|
| Button | `src/components/ui/Button.tsx` | ปุ่มต่างๆ |
| Card | `src/components/ui/Card.tsx` | การ์ดแสดงข้อมูล |
| Input | `src/components/ui/Input.tsx` | ช่องกรอกข้อมูล |
| Badge | `src/components/ui/Badge.tsx` | ป้ายแสดงสถานะ |
| Avatar | `src/components/ui/Avatar.tsx` | รูปโปรไฟล์ |
| Icons | `src/components/ui/Icons.tsx` | ไอคอนต่างๆ |
| ThemeToggle | `src/components/ui/ThemeToggle.tsx` | สลับ Dark/Light Mode |

---

## 🗄️ ข้อมูลและ API

### เก็บใน PostgreSQL (ผ่าน API)
- ✅ **Characters** - `/api/characters`
- ✅ Students, Teachers, Sessions - auth related
- ✅ Moods - `/api/mood`
- ✅ Reports - `/api/reports`

### เก็บใน IndexedDB (Browser Local)
- ✅ **Chats** - ประวัติการแชท
- ✅ **Messages** - ข้อความในแชท
- ✅ **Summaries** - สรุปการสนทนา

---

## 📝 หมายเหตุ

**Legend:**
- ⬜ ยังไม่เริ่ม
- 🔄 กำลังทำ
- ✅ เสร็จแล้ว

**อัพเดทล่าสุด:** 19 มกราคม 2569

---

## 🚀 ขั้นตอนการรีดีไซน์

1. **วางแผน Design** - ออกแบบ UI/UX ใหม่
2. **สร้าง Design System** - อัพเดท Components
3. **รีดีไซน์ทีละหน้า** - ตามลำดับข้างบน
4. **ทดสอบ** - ทดสอบ functionality ทุกหน้า
5. **Review** - ตรวจสอบ responsive และ accessibility
