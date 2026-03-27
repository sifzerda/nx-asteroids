import bcrypt from 'bcrypt';
import { prisma } from '../../../../lib/prisma';
import { signJWT } from '../../../../lib/auth';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Use your jose-based signJWT helper here
    const token = await signJWT({ sub: user.id, username: user.username, email: user.email}, { expiresIn: '1h' });

    return jsonResponse({ token }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}