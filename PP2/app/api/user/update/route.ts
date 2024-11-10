// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';
import { validatePhone } from '@/app/utils/validation';
import { avatarConfig } from '@/app/config/avatar';

const prisma = new PrismaClient();
const VALID_AVATAR_PATHS = avatarConfig.getValidPaths();

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}

interface UpdateProfileResponse {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    phone: string | null;
}

interface ErrorResponse {
    error: string;
}

async function handler (req: AuthenticatedRequest): Promise<NextResponse<UpdateProfileResponse | ErrorResponse>> {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, avatar }: UpdateProfileRequest = await req.json();

    if (phone && !validatePhone(phone)) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (avatar && !VALID_AVATAR_PATHS.includes(avatar)) {
        return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: firstName || existingUser?.firstName,
                lastName: lastName || existingUser?.lastName,
                phone: phone || existingUser?.phone,
                avatar: avatar || existingUser?.avatar,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
            }
        });

        return NextResponse.json({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone,
        },
        { status: 200 });

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const PUT = withAuth(handler);