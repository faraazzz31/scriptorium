// Used Github co-pilot to help me write this code

import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: number;
    email: string;
    role: string;
}


export function signAccessToken(payload: TokenPayload): string {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    })
    return accessToken
}

export function signRefreshToken(payload: TokenPayload): string {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const refreshToken =  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    })
    return refreshToken
}

export function verifyAccessToken(token: string): TokenPayload {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    } catch (error) {
        console.log(`Error in verifyAccessToken: ${error}`);
        throw new Error('Invalid access token')
    }
}

export function verifyRefreshToken(token: string): TokenPayload {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
        console.log(`Error in verifyRefreshToken: ${error}`);
        throw new Error('Invalid refresh token')
    }
}