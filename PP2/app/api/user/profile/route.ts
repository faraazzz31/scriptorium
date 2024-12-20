// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

// Define interfaces for our data structures
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: number | null;
    role: string;
}

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface ErrorResponse {
    error: string;
}

const prisma = new PrismaClient();

async function handler (req: AuthenticatedRequest): Promise<NextResponse<User | ErrorResponse>> {
    const user = req.user;

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
                role: true,
            },
        }) as User | null;

        if (!userProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                avatar: userProfile.avatar,
                phone: userProfile.phone,
                role: userProfile.role,
            },
            { status: 200 });
    } catch (error) {
        console.error(`Error in /app/api/user/profile: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);

