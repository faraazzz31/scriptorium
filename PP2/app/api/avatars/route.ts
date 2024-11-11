// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { avatarConfig } from '@/app/config/avatar';

interface AvatarResponse {
    data: object[];
    message: string;
}

interface ErrorResponse {
    error: string;
}

export async function GET(): Promise<NextResponse<AvatarResponse | ErrorResponse>> {
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