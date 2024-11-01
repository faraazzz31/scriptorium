import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateEmail, validatePassword, validatePhone } from '@/app/utils/validation.js';
import bcrypt from 'bcrypt';
import { avatarConfig } from '@/app/config/avatar.js';

const prisma = new PrismaClient();
const VALID_AVATAR_PATHS = avatarConfig.getValidPaths();

export async function POST(request) {
    const { email, password, firstName, lastName, phone, role, selectedAvatar } = await request.json();

    console.log(`Signup request: ${email}, ${firstName}, ${lastName}, ${phone}`);

    if (!email || !password || !firstName || !lastName || !phone) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!validatePassword(password)) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    if (!validatePhone(phone)) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (selectedAvatar && !VALID_AVATAR_PATHS.includes(selectedAvatar)) {
        return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role || 'USER',
                avatar: selectedAvatar || avatarConfig.getDefaultPath(),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                avatar: true,
            }
        });

        return NextResponse.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}