import { NextResponse } from 'next/server';
import { avatarConfig } from '@/app/config/avatar.js';

export async function GET() {
    try {
        return NextResponse.json({
            data: avatarConfig.defaultAvatars,
            message: 'Avatars retrieved successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching avatars:', error);
        return NextResponse.json({
            error: 'Failed to fetch avatars'
        }, { status: 500 });
    }
}