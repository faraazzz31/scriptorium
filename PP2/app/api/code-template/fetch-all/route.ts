import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

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

export async function GET(req: AuthenticatedRequest): Promise<NextResponse<CodeTemplateResponse | ErrorResponse>> {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const query = searchParams.get('query');
    const tag_id = searchParams.get('tag_id');

    console.log(`page: ${page}, limit: ${limit}, searchQuery: ${query}, tag_id: ${tag_id}`);

    if (page < 1 || limit < 1) {
        return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
    }

    try {
        const where: Prisma.CodeTemplateWhereInput = {};

        // Combine title and explanation search into OR condition
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

        if (tag_id) {
            where.tags = {
                some: {
                    id: parseInt(tag_id)
                }
            };
        }

        console.log(`where: ${JSON.stringify(where)}`);

        // First, get the total count
        const totalCount = await prisma.codeTemplate.count({
            where: where,
        });

        console.log(`totalCount: ${totalCount}`);

        const offset = (page - 1) * limit;

        // Then get the templates with ordering
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
                    forks: {
                        _count: 'desc'
                    }
                },
                {
                    updatedAt: 'desc'
                }
            ]
        });

        console.log(`codeTemplates: ${JSON.stringify(codeTemplates)}`);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: codeTemplates,
            totalPages: totalPages,
            totalCount: totalCount,
        });
    } catch (error) {
        console.error(`Error in /app/api/code_template/fetch: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}