import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    try {
        console.log('Fetching code template with id:', id)
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                tags: true
            }
        });

        if (!codeTemplate) {
            return NextResponse.json({ error: 'Code template not found' }, { status: 404 });
        }

        return NextResponse.json({ data: codeTemplate }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}