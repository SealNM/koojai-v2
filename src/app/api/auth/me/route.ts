import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('koojai_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await authService.getUserFromToken(token);

    if (!user) {
      // Token is invalid, clear the cookie
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set('koojai_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
