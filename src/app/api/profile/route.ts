import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { authService } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('koojai_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.getUserFromToken(token);
    if (!user || user.user_type !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nickname } = body;

    await sql`
      UPDATE students 
      SET nickname = ${nickname || null}, updated_at = NOW() 
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true, message: 'อัพเดทสำเร็จ' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
