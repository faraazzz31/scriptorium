import jwt from 'jsonwebtoken';

export function signAccessToken(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    })
    return accessToken
}

export function signRefreshToken(payload) {
    const refreshToken =  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    })
    return refreshToken
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        console.log(`Error in verifyAccessToken: ${error}`);
        throw new Error('Invalid access token')
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
        console.log(`Error in verifyRefreshToken: ${error}`);
        throw new Error('Invalid refresh token')
    }
}