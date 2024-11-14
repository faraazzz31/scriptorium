// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface CodeTemplateResponse {
    totalPages: number;
    totalCount: number;
}

interface ErrorResponse {
    error: string;
}

const prisma = new PrismaClient();

async function handler (req: AuthenticatedRequest): Promise<NextResponse<CodeTemplateResponse | ErrorResponse>> {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const language = searchParams.get('language');
    const query = searchParams.get('query');
    const tag_id = searchParams.get('tag_id');

    console.log(`page: ${page}, limit: ${limit}, query: ${query}, tag_id: ${tag_id}`);

    if (page < 1 || limit < 1) {
        return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
    }

    try {
        const where: Prisma.CodeTemplateWhereInput = {};
        where.authorId = user.id;

        if (query) {
            where.OR = [
                {
                    title: {
                        contains: query.toLowerCase(),
                    }
                },
                {
                    explanation: {
                        contains: query.toLowerCase(),
                    }
                }
            ];
        }

        if (language) {
            where.language = language;
        }

        if (tag_id) {
            where.tags = {
                some: {
                    id: parseInt(tag_id)
                }
            };
        }

        console.log(`where: ${JSON.stringify(where)}`);

        const totalCount = await prisma.codeTemplate.count({
            where: where,
        });

        console.log(`totalCount: ${totalCount}`);

        const offset = (page - 1) * limit;

        const codeTemplates = await prisma.codeTemplate.findMany({
            skip: offset,
            take: limit,
            where: where,
            include: {
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                forks: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        author: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
                _count: {
                    select: {
                        forks: true
                    }
                }
            },
            orderBy: [
                {
                    updatedAt: 'desc'
                },
                {
                    forks: {
                        _count: 'desc'
                    }
                }
            ]
        });

        // console.log(`codeTemplates: ${JSON.stringify(codeTemplates)}`);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: codeTemplates,
            totalPages: totalPages,
            totalCount: totalCount,
        });
    } catch (error) {
        console.log(`fetch-user error: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);