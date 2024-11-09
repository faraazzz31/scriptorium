// Used Claude to help me with the idea of middleware

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../lib/auth';

export function withAuth(handler) {
    return async function(req, params) {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            )
        }

        const token = authHeader.split(' ')[1]

        try {
            const decoded = await verifyAccessToken(token)
            req.user = decoded

            return handler(req, params)

        } catch (error) {
            console.error(`Error in withAuth middleware: ${error}`)

            return NextResponse.json(
                {
                    error: 'Unauthorized - Invalid token',
                    code: 'TOKEN_EXPIRED'
                },
                { status: 401 })
        }
    }
}