import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

// POST reset password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสผ่านใหม่' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await sql`
      UPDATE students SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
