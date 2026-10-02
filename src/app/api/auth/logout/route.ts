import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST() {
  const response = NextResponse.json({ success: true, redirect: '/admin/login' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
