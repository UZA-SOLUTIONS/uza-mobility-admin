import { auth } from '@/lib/auth';
import { authRoutes } from '@/config/routes';
import { hasAdminAccess } from '@/lib/permissions';
import { isMeUser } from '@/types/auth/me-user';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isSignOutFlow = req.nextUrl.searchParams.get('signout') === '1';

  const isLoginPage = pathname === '/login';
  const isProtected = pathname.startsWith('/admin');

  const user = req.auth?.user;
  const isAdminUser =
    isMeUser(user) && hasAdminAccess(user.permissions, user.roles);

  // Logged-in user on login page → redirect to admin
  if (isLoginPage && isAdminUser) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  }

  if (isLoginPage && req.auth && !isAdminUser && !isSignOutFlow) {
    const logout = new URL(authRoutes.login, req.nextUrl.origin);
    logout.searchParams.set('signout', '1');
    return NextResponse.redirect(logout);
  }

  // Unauthenticated on protected page → redirect to login
  if (isProtected && !req.auth) {
    const login = new URL(authRoutes.login, req.nextUrl.origin);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  if (isProtected && req.auth && !isAdminUser) {
    const logout = new URL(authRoutes.login, req.nextUrl.origin);
    logout.searchParams.set('signout', '1');
    return NextResponse.redirect(logout);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/check-email',
  ],
};
