import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('koojai_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    const result = await authService.changePassword(
      user.id,
      user.user_type,
      oldPassword,
      newPassword
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
