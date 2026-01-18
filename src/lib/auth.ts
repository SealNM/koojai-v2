import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthUser, LoginResponse, Student, Teacher } from '@/types';

/**
 * 🔐 Auth Service (Server-side only)
 * จัดการ Authentication ทั้งหมด: Login, Logout, Token Validation
 */

// ใช้ neon() แทน Pool สำหรับ serverless environment
const sql = neon(process.env.DATABASE_URL!);

// จำนวนวันที่ token ใช้ได้
const TOKEN_EXPIRY_DAYS = 7;

export const authService = {
  /**
   * Login สำหรับนักเรียน
   * รับ identifier (email หรือ student_id) + password
   */
  async loginStudent(identifier: string, password: string): Promise<LoginResponse> {
    try {
      // ค้นหานักเรียนจาก email หรือ student_id
      const result = await sql`
        SELECT * FROM students 
        WHERE (email = ${identifier.toLowerCase().trim()} OR student_id = ${identifier.toLowerCase().trim()}) AND is_active = true
      `;

      if (result.length === 0) {
        return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้' };
      }

      const student: Student & { password_hash: string } = result[0] as Student & { password_hash: string };

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await bcrypt.compare(password, student.password_hash);
      if (!isPasswordValid) {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
      }

      // สร้าง session token
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

      await sql`
        INSERT INTO sessions (user_id, user_type, token, expires_at)
        VALUES (${student.id}, 'student', ${token}, ${expiresAt.toISOString()})
      `;

      // สร้าง AuthUser object (ไม่ส่ง password_hash กลับไป)
      const user: AuthUser = {
        id: student.id!,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        user_type: 'student',
        student_id: student.student_id,
        nickname: student.nickname,
        grade_level: student.grade_level,
        classroom: student.classroom,
        profile_image_url: student.profile_image_url,
      };

      return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user, token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในระบบ' };
    }
  },

  /**
   * Login สำหรับครู/แอดมิน
   */
  async loginTeacher(email: string, password: string): Promise<LoginResponse> {
    try {
      const result = await sql`
        SELECT * FROM teachers 
        WHERE email = ${email.toLowerCase().trim()} AND is_active = true
      `;

      if (result.length === 0) {
        return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้' };
      }

      const teacher: Teacher & { password_hash: string } = result[0] as Teacher & { password_hash: string };

      const isPasswordValid = await bcrypt.compare(password, teacher.password_hash);
      if (!isPasswordValid) {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
      }

      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

      await sql`
        INSERT INTO sessions (user_id, user_type, token, expires_at)
        VALUES (${teacher.id}, 'teacher', ${token}, ${expiresAt.toISOString()})
      `;

      const user: AuthUser = {
        id: teacher.id!,
        email: teacher.email,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        user_type: 'teacher',
        role: teacher.role,
      };

      return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user, token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในระบบ' };
    }
  },

  /**
   * ตรวจสอบว่า Token ยังใช้ได้อยู่ไหม
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const result = await sql`
        SELECT * FROM sessions 
        WHERE token = ${token} AND expires_at > NOW()
      `;

      return result.length > 0;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Logout - ลบ session
   */
  async logout(token: string): Promise<void> {
    try {
      await sql`DELETE FROM sessions WHERE token = ${token}`;
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * ดึงข้อมูล User จาก Token
   */
  async getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
      // หา session
      const sessionResult = await sql`
        SELECT * FROM sessions 
        WHERE token = ${token} AND expires_at > NOW()
      `;

      if (sessionResult.length === 0) return null;

      const session = sessionResult[0];

      // ดึงข้อมูล user ตาม type
      if (session.user_type === 'student') {
        const result = await sql`SELECT * FROM students WHERE id = ${session.user_id}`;
        if (result.length === 0) return null;

        const student = result[0];
        return {
          id: student.id as number,
          email: student.email as string,
          first_name: student.first_name as string,
          last_name: student.last_name as string,
          user_type: 'student',
          student_id: student.student_id as string,
          nickname: student.nickname as string | undefined,
          grade_level: student.grade_level as string | undefined,
          classroom: student.classroom as string | undefined,
          profile_image_url: student.profile_image_url as string | undefined,
        };
      } else {
        const result = await sql`SELECT * FROM teachers WHERE id = ${session.user_id}`;
        if (result.length === 0) return null;

        const teacher = result[0];
        return {
          id: teacher.id as number,
          email: teacher.email as string,
          first_name: teacher.first_name as string,
          last_name: teacher.last_name as string,
          user_type: 'teacher',
          role: teacher.role as AuthUser['role'],
        };
      }
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  /**
   * เปลี่ยนรหัสผ่าน
   */
  async changePassword(
    userId: number, 
    userType: 'student' | 'teacher', 
    oldPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // ดึงรหัสผ่านเก่า
      let result;
      if (userType === 'student') {
        result = await sql`SELECT password_hash FROM students WHERE id = ${userId}`;
      } else {
        result = await sql`SELECT password_hash FROM teachers WHERE id = ${userId}`;
      }
      
      if (result.length === 0) {
        return { success: false, message: 'ไม่พบบัญชีผู้ใช้' };
      }

      // ตรวจสอบรหัสผ่านเก่า
      const isValid = await bcrypt.compare(oldPassword, result[0].password_hash as string);
      if (!isValid) {
        return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
      }

      // Hash รหัสผ่านใหม่
      const newHash = await bcrypt.hash(newPassword, 10);

      // อัพเดทรหัสผ่าน
      if (userType === 'student') {
        await sql`UPDATE students SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${userId}`;
      } else {
        await sql`UPDATE teachers SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${userId}`;
      }

      return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาด' };
    }
  },
};

export default authService;
