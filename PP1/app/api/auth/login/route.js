import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        console.log(`Userid: ${user.id}, email: ${user.email}, role: ${user.role}`);
        const payload = { id: user.id, email: user.email, role: user.role};

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        console.log(`Access Token: ${accessToken}, Refresh Token: ${refreshToken}`);

        return NextResponse.json({ "accessToken" : accessToken, "refreshToken": refreshToken }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}