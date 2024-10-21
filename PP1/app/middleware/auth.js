// lib/auth.js

import jwt from 'jsonwebtoken';

export const verifyAccessToken = async (request) => {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`Decoded: ${JSON.stringify(decoded)}`);


        return decoded;
    } catch (error) {
        console.error(`Error in verifyAccessToken: ${error}`);
        return null;
    }
}
