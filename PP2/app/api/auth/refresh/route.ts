// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, signAccessToken } from '@/app/lib/auth'

interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

interface RefreshResponse {
    accessToken: string;
}

interface ErrorResponse {
    error: string;
}

interface DecodedToken extends TokenPayload {
    iat?: number;
    exp?: number;
}


export async function POST(req: NextRequest): Promise<NextResponse<RefreshResponse | ErrorResponse>> {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Refresh Token is required' },
            { status: 401 }
        )
    }

    const refreshToken = authHeader.split(' ')[1]

    try {
        const decoded: DecodedToken = await verifyRefreshToken(refreshToken)

        const payload: TokenPayload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        }

        const accessToken: string = signAccessToken(payload)
        return NextResponse.json(
            { accessToken },
            { status: 200 }
        );
    } catch (error) {
        console.error('Refresh token error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
}