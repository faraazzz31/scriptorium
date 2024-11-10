// Used Claude to help me with the idea of middleware

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '../lib/auth';

interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface AuthError {
    error: string;
    code?: string;
}

type RouteHandler = (
    req: AuthenticatedRequest,
    params?: Record<string, string | string[]>
) => Promise<NextResponse>;

/**
 * Authentication middleware that verifies JWT tokens
 * @param handler The route handler to wrap with authentication
 * @returns A wrapped handler that includes authentication
 */
export function withAuth(handler: RouteHandler): RouteHandler {
    return async function(
        req: AuthenticatedRequest,
        params?: Record<string, string | string[]>
    ): Promise<NextResponse> {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response: AuthError = {
                error: 'Unauthorized - No token provided'
            };

            return NextResponse.json(response, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = await verifyAccessToken(token);
            req.user = decoded;

            return handler(req, params);

        } catch (error) {
            console.error('Error in withAuth middleware:', error);

            const response: AuthError = {
                error: 'Unauthorized - Invalid token',
                code: 'TOKEN_EXPIRED'
            };

            return NextResponse.json(response, { status: 401 });
        }
    };
}

// Type guard for checking if a request is authenticated
export function isAuthenticated(
    req: AuthenticatedRequest
): req is AuthenticatedRequest & { user: TokenPayload } {
    return req.user !== undefined;
}