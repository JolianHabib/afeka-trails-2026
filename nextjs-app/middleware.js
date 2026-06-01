import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/trails')) {
    return NextResponse.next();
  }

  const xToken = request.headers.get('x-access-token');
  if (!xToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(xToken, secret);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-fullname', payload.fullName || '');
    requestHeaders.set('x-user-email', payload.email || '');

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
export const config = {
  matcher: ['/api/trails/:path*', '/trail-result']
};
