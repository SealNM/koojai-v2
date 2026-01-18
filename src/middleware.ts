import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes ที่ต้อง login ก่อน
const protectedRoutes = ['/mood', '/chat', '/profile', '/admin'];
// Routes สำหรับคนที่ยังไม่ login
const publicOnlyRoutes = ['/login', '/teacher/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('koojai_token')?.value;
  const { pathname } = request.nextUrl;

  // ถ้าเข้าหน้า protected แต่ไม่มี token -> redirect ไป login
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ถ้ามี token แล้วเข้าหน้า login -> redirect ไปหน้าหลัก (handle ใน client)
  // เราไม่ทำใน middleware เพราะต้อง validate token ก่อน

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' ,
  ],
};
