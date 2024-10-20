// app/api/auth/profile/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/app/middleware/auth.js'

const prisma = new PrismaClient();

export async function GET(request) {
    const user = await verifyAccessToken(request);

    console.log(`Get user profile request: ${user}`);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
            },
        });

        return NextResponse.json(
            {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                avatar: userProfile.avatar,
                phone: userProfile.phone,
            },
            { status: 200 });
    } catch (error) {
        console.error(`Error in /app/api/user/profile: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
