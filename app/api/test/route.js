// npm run dev and then visit http://localhost:3000/api/test to test the Prisma connection and query. 

import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('Testing Prisma connection...');

    // simple query
    const users = await prisma.user.findMany();

    console.log('Query successful:', users);

    return new Response(
      JSON.stringify({
        success: true,
        count: users.length,
        users,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Prisma test error:');
    console.error(error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}