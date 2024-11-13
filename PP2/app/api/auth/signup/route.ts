// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateEmail, validatePassword, validatePhone } from '@/app/utils/validation';
import bcrypt from 'bcrypt';
import { avatarConfig } from '@/app/config/avatar';

const prisma = new PrismaClient();
const VALID_AVATAR_PATHS = avatarConfig.getValidPaths();

interface SignupRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: string;
    selectedAvatar?: string;
}

interface SignupResponse {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    avatar: string;
}

interface ErrorResponse {
    error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SignupResponse | ErrorResponse>> {
    const { email, password, firstName, lastName, phone, role, selectedAvatar }: SignupRequest = await request.json();

    console.log(`Signup request: ${email}, ${firstName}, ${lastName}, ${phone}`);

    if (!email || !password || !firstName || !lastName || !phone) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format. Please enter a valid email address' }, { status: 400 });
    }

    if (!validatePhone(phone)) {
        return NextResponse.json({ error: 'Phone number must be 10 digits long' }, { status: 400 });
    }

    if (!validatePassword(password)) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' }, { status: 400 });
    }

    if (selectedAvatar && !VALID_AVATAR_PATHS.includes(selectedAvatar)) {
        return NextResponse.json({ error: 'Please select a valid avatar from the provided options' }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ error: 'This email is already registered. Please use a different email or try logging in' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || '10'));

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
        }) as SignupResponse;

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
        return NextResponse.json({ error: 'Failed to create account. Please try again later or contact support if the problem persists' }, { status: 500 });
    }
}