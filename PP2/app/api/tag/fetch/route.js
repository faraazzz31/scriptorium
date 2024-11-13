// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET () {
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