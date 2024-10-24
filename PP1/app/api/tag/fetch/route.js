import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler (req) {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tags = await prisma.tag.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        return NextResponse.json({
            tags: tags
            }
        )
    } catch (error) {
        console.error(`Error in /app/api/tag/fetch: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);