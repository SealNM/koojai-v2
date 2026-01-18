import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

// GET single student
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await sql`
      SELECT id, student_id, email, first_name, last_name, nickname, 
             grade_level, classroom, birth_date, profile_image_url, 
             is_active, created_at, updated_at
      FROM students WHERE id = ${parseInt(id)}
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลนักเรียน' }, { status: 404 });
    }
    
    return NextResponse.json({ student: result[0] });
  } catch (error) {
    console.error('Error getting student:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PUT update student
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { first_name, last_name, nickname, grade_level, classroom, is_active } = body;

    await sql`
      UPDATE students SET 
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        nickname = COALESCE(${nickname}, nickname),
        grade_level = COALESCE(${grade_level}, grade_level),
        classroom = COALESCE(${classroom}, classroom),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE student (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await sql`
      UPDATE students SET is_active = false, updated_at = NOW() WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
