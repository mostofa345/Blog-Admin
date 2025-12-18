import { NextResponse } from "next/server";

export function middleware(request) {
  // আপনার কুকি বা টোকেনের নাম এখানে দিন (যেমন: 'authToken')
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;

  // ১. ইউজার যদি হোম পেজে (/) আসে এবং লগইন না থাকে, তাকে লগইন পেজে পাঠান
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ২. ইউজার যদি লগইন থাকে এবং লগইন পেজে যেতে চায়, তাকে ড্যাশবোর্ডে পাঠিয়ে দিন
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};