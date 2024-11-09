// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withAuth } from '@/app/middleware/auth';

async function handler (req) {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear cookies upon logout
    cookies().delete('accessToken'); // Deletes the access token cookie
    cookies().delete('refreshToken'); // Deletes the refresh token cookie

    return NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
    );
}

export const POST = withAuth(handler);