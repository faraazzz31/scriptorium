// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '@/app/lib/auth';

const prisma = new PrismaClient();

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

interface ErrorResponse {
    error: string;
}

interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
    try {
        const { email, password }: LoginRequest = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const user: User | null = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 400 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 400 }
            );
        }

        console.log(`Userid: ${user.id}, email: ${user.email}, role: ${user.role}`);
        const payload: TokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role
        };;

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        console.log(`Access Token: ${accessToken}, Refresh Token: ${refreshToken}`);

        return NextResponse.json(
            {
                accessToken,
                refreshToken
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}