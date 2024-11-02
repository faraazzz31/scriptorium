import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth.js';
import { validatePhone } from '@/app/utils/validation.js';
import { avatarConfig } from '@/app/config/avatar.js';

const prisma = new PrismaClient();
const VALID_AVATAR_PATHS = avatarConfig.getValidPaths();

async function handler (req) {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, avatar } = await req.json();

    if (phone && !validatePhone(phone)) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (avatar && !VALID_AVATAR_PATHS.includes(avatar)) {
        return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                phone: phone || user.phone,
                avatar: avatar || user.avatar,
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