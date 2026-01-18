import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      );
    }

    const result = await authService.loginTeacher(email, password);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // ส่ง token กลับพร้อมกับ user data
    const response = NextResponse.json(result);
    
    // Set HTTP-only cookie for better security
    if (result.token) {
      response.cookies.set('koojai_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Teacher Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    );
  }
}
