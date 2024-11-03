import { NextResponse } from 'next/server'
import { verifyRefreshToken, signAccessToken } from '@/app/lib/auth'

export async function POST(req) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Refresh Token is required' },
            { status: 401 }
        )
    }

    const refreshToken = authHeader.split(' ')[1]

    try {
        const decoded = await verifyRefreshToken(refreshToken)

        const payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        }

        const accessToken = signAccessToken(payload)
        return NextResponse.json({ accessToken: accessToken }, { status: 200 })
    } catch (error) {
        console.error('Refresh token error:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}