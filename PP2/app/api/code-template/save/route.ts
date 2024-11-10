import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Tag, Prisma } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface CreateTemplateRequest {
    title: string;
    explanation?: string;
    code: string;
    language: string;
    tag_ids?: string[];
    forkOfId?: string;
}

interface CreateTemplateResponse {
    id: number;
    title: string;
    explanation: string | null;
    code: string;
    authorId: number;
    tags: Tag[];
    forkOfId?: number | null;
}

interface ErrorResponse {
    error: string;
}

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest): Promise<NextResponse<CreateTemplateResponse | ErrorResponse>> {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
    const {
        title,
        explanation,
        code,
        language,
        tag_ids,
        forkOfId,
    }: CreateTemplateRequest = await req.json();

    console.log(`Received data: title: ${title}, code: ${code}, explanation: ${explanation}, tags: ${tag_ids}, language: ${language}, forkOfId: ${forkOfId}`);

    // Validate required fields
    if (!title || !code || !language) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if we need to validate the original template for forking
    if (forkOfId) {
        const originalTemplate = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(forkOfId) },
        });

        if (!originalTemplate) {
            return NextResponse.json({ error: 'Original template not found' }, { status: 404 });
        }
    }

    // Build the data structure for Prisma
    const data: Prisma.CodeTemplateCreateInput = {
        title,
        code,
        language,
        explanation: explanation || '',
        author: {
            connect: {
                id: user.id,
            },
        },
        // Optionally connect to the forked template
        ...(forkOfId && {
        forkOf: {
            connect: {
            id: parseInt(forkOfId),
            },
        },
        }),
    };

    // Handle tags if provided
    if (tag_ids && tag_ids.length > 0) {
        const tags = await prisma.tag.findMany({
        where: {
            id: {
                in: tag_ids.map(id => parseInt(id)),
            },
        },
        });

        if (tags.length !== tag_ids.length) {
            return NextResponse.json({ error: 'Invalid tags' }, { status: 400 });
        }

        data.tags = {
            connect: tag_ids.map((tag_id) => ({ id: parseInt(tag_id) })),
        };
    }

    // Create the code template in the database
    const codeTemplate = await prisma.codeTemplate.create({
        data,
        include: {
            tags: true, // Include tags in the response
        },
    });

    const response: CreateTemplateResponse = {
        id: codeTemplate.id,
        title: codeTemplate.title,
        explanation: codeTemplate.explanation,
        code: codeTemplate.code,
        authorId: codeTemplate.authorId,
        tags: codeTemplate.tags,
        forkOfId: codeTemplate.forkOfId,
    };

    return NextResponse.json(response);

    } catch (error) {
    console.error('Error in /app/api/code_template/save:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
