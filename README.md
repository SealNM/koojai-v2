# KooJai (คู่ใจ) - AI Listening Friend

ระบบ AI เพื่อนฟังใจสำหรับนักเรียน พัฒนาด้วย Next.js 16 + TypeScript + Tailwind CSS

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` จาก `.env.example`:

```bash
cp .env.example .env.local
```

แก้ไขค่าต่างๆ ใน `.env.local`:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Google AI (Gemini)
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication APIs
│   │   ├── mood/          # Mood tracking API
│   │   ├── profile/       # Profile APIs
│   │   └── reports/       # Reports API
│   ├── admin/             # Admin pages
│   │   └── dashboard/     # Teacher dashboard
│   ├── chat/              # Chat page
│   ├── login/             # Student login
│   ├── mood/              # Mood selection
│   ├── profile/           # Profile page
│   ├── teacher/           # Teacher login
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React Components
│   ├── ProtectedRoute.tsx # Auth guard
│   └── PublicRoute.tsx    # Public route guard
├── contexts/              # React Contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Server utilities
│   ├── auth.ts            # Auth service
│   └── db.ts              # Database utilities
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
└── middleware.ts          # Next.js middleware
```

## 🔐 Authentication Flow

1. **Student Login**: `/login` - ใช้ student_id หรือ email + password
2. **Teacher Login**: `/teacher/login` - ใช้ email + password
3. **Session**: ใช้ HTTP-only cookie (`koojai_token`)
4. **Protected Routes**: ใช้ middleware + client-side guards

## 🎨 Features

### สำหรับนักเรียน
- ✅ Login ด้วย student_id หรือ email
- ✅ บันทึกอารมณ์ประจำวัน
- ✅ แชทกับ AI เพื่อนฟังใจ
- ✅ ดูและแก้ไขโปรไฟล์
- ✅ เปลี่ยนรหัสผ่าน

### สำหรับครู/Admin
- ✅ Dashboard ดูภาพรวม
- ✅ ดูรายงานสุขภาพจิตนักเรียน
- ✅ กรองและค้นหารายงาน
- ✅ จัดการบัญชีนักเรียน

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Neon Postgres (@neondatabase/serverless)
- **AI**: Google Gemini API
- **Authentication**: Custom session-based auth

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

---

Made with 💙 for Thai students' mental health
