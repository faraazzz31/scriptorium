// Used Github co-pilot to help me write this code

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
        const { codeTemplateId } = await req.json();

        console.log(`codeTemplateId: ${codeTemplateId}`);

        if (!codeTemplateId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                id: parseInt(codeTemplateId),
            }
        });

        if (!codeTemplate) {
            return NextResponse.json({ error: 'Code template not found' }, { status: 404 });
        }

        if (codeTemplate.authorId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.codeTemplate.delete({
            where: {
                id: parseInt(codeTemplateId),
            },
        });

        return NextResponse.json({
            message: 'Code template deleted successfully',
            codeTemplateId: codeTemplate.id,
        });

    } catch (error) {
        console.error(`Error in /app/api/code-template/delete: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const DELETE = withAuth(handler);