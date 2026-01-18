import { neon } from '@neondatabase/serverless';
import { TeacherReport, MoodEntry } from '@/types';

/**
 * 🗄️ Database Utility (Neon Postgres Version)
 * ใช้ @neondatabase/serverless เพื่อเชื่อมต่อกับ Neon Postgres
 */

const sql = neon(process.env.DATABASE_URL!);

// ฟังก์ชันเปิด/สร้างฐานข้อมูล
export const initDB = async (): Promise<void> => {
  console.log("Neon DB initialized");
};

// ฟังก์ชันบันทึกรายงาน
export const saveReport = async (report: TeacherReport): Promise<void> => {
  try {
    await sql`
      INSERT INTO reports (
        student_id, 
        severity_level, 
        problem_category, 
        summary_for_teacher, 
        recommendation_for_teacher, 
        should_notify_teacher, 
        memory_for_next_session, 
        healing_quote, 
        created_at
      ) VALUES (
        ${report.student_id},
        ${report.severity_level},
        ${report.problem_category},
        ${report.summary_for_teacher},
        ${report.recommendation_for_teacher},
        ${report.should_notify_teacher},
        ${report.memory_for_next_session},
        ${report.healing_quote},
        NOW()
      )
    `;
  } catch (err) {
    console.error("Error saving report to Neon:", err);
    throw err;
  }
};

// ฟังก์ชันบันทึกอารมณ์
export const saveMood = async (entry: MoodEntry): Promise<void> => {
  try {
    await sql`
      INSERT INTO moods (student_id, mood, created_at)
      VALUES (${entry.student_id}, ${entry.mood}, NOW())
    `;
  } catch (err) {
    console.error("Error saving mood to Neon:", err);
    throw err;
  }
};

// ฟังก์ชันดึง "ความจำล่าสุด" (Memory) ของนักเรียนคนนั้นๆ
export const getLastMemory = async (studentId: string): Promise<string | null> => {
  try {
    const result = await sql`
      SELECT memory_for_next_session 
      FROM reports 
      WHERE student_id = ${studentId}
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (result.length > 0) {
      return result[0].memory_for_next_session as string;
    }
    return null;
  } catch (err) {
    console.error("Error getting memory from Neon:", err);
    return null;
  }
};

// ฟังก์ชันดึงรายงานทั้งหมด (สำหรับ Teacher Dashboard)
export const getReports = async (): Promise<(TeacherReport & { id: number; created_at: string })[]> => {
  try {
    const result = await sql`
      SELECT * FROM reports ORDER BY created_at DESC
    `;
    return result as (TeacherReport & { id: number; created_at: string })[];
  } catch (err) {
    console.error("Error getting reports from Neon:", err);
    return [];
  }
};

// Export sql สำหรับใช้งานทั่วไป
export { sql };
