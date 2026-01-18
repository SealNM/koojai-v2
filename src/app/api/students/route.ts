import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

// GET all students
export async function GET() {
  try {
    const result = await sql`
      SELECT id, student_id, email, first_name, last_name, nickname, 
             grade_level, classroom, birth_date, profile_image_url, 
             is_active, created_at, updated_at
      FROM students 
      ORDER BY grade_level, classroom, first_name
    `;
    return NextResponse.json({ students: result });
  } catch (error) {
    console.error('Error getting students:', error);
    return NextResponse.json({ students: [], error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// POST create new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, email, password, first_name, last_name, nickname, grade_level, classroom, birth_date } = body;

    if (!student_id || !email || !password || !first_name || !last_name || !grade_level) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    // Check if exists
    const existing = await sql`
      SELECT * FROM students WHERE student_id = ${student_id} OR email = ${email.toLowerCase()}
    `;

    if (existing.length > 0) {
      if (existing[0].student_id === student_id) {
        return NextResponse.json({ success: false, message: 'รหัสนักเรียนนี้มีในระบบแล้ว' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: 'อีเมลนี้มีในระบบแล้ว' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert
    const result = await sql`
      INSERT INTO students (
        student_id, email, password_hash, first_name, last_name, 
        nickname, grade_level, classroom, birth_date, is_active
      ) VALUES (
        ${student_id}, ${email.toLowerCase()}, ${passwordHash}, ${first_name}, ${last_name}, 
        ${nickname || null}, ${grade_level}, ${classroom || null}, ${birth_date || null}, true
      )
      RETURNING id, student_id, email, first_name, last_name, nickname, 
                grade_level, classroom, birth_date, is_active, created_at
    `;

    return NextResponse.json({ success: true, student: result[0] });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
