// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withAuth } from '@/app/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface LogoutResponse {
    message: string;
}

interface ErrorResponse {
    error: string;
}

async function handler (req: AuthenticatedRequest): Promise<NextResponse<LogoutResponse | ErrorResponse>> {
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