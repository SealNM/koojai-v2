import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('koojai_token')?.value;

    if (token) {
      await authService.logout(token);
    }

    const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
    
    // Clear the cookie
    response.cookies.set('koojai_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
