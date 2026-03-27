import { NextResponse } from 'next/server';
import { verifyJWT } from './auth';

export async function getUserFromRequest(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const payload = await verifyJWT(token);
    return payload; // e.g. { sub: userId, email, iat, exp }
  } catch {
    return null;
  }
}

// Middleware style helper for protecting routes
export async function requireUser(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}
